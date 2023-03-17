import { NowPlayingConfig } from "../../database/entity/NowPlayingConfig";
import { User } from "../../database/entity/User";
import { GowonContext } from "../../lib/context/Context";
import { sortConfigOptions } from "../../lib/nowplaying/componentMap";
import { BaseService } from "../BaseService";

export const UNUSED_CONFIG = "unused";

export class ConfigService extends BaseService {
  async getConfigForUser(ctx: GowonContext, user: User): Promise<string[]> {
    this.log(ctx, `Fetching config for user ${user.discordID}`);

    const config = await this.getOrCreateConfig(ctx, user);
    return sortConfigOptions(config.config);
  }

  async getConfigNoUnused(ctx: GowonContext, user: User) {
    return (await this.getConfigForUser(ctx, user)).filter(
      (c) => c !== UNUSED_CONFIG
    );
  }

  async saveConfigForUser(ctx: GowonContext, user: User, config: string[]) {
    this.log(
      ctx,
      `Saving config for user ${user.discordID} (${config.join(", ")})`
    );

    const dbConfig = await this.getOrCreateConfig(ctx, user);

    dbConfig.config = config;

    return await dbConfig.save();
  }

  private async getOrCreateConfig(
    ctx: GowonContext,
    user: User
  ): Promise<NowPlayingConfig> {
    this.log(ctx, `Fetching or creating config for user ${user.discordID}`);

    const existing = await NowPlayingConfig.findOneBy({
      user: { id: user.id },
    });

    if (existing) return existing;

    const newConfig = NowPlayingConfig.create({
      user,
      config: [UNUSED_CONFIG],
    });

    return await newConfig.save();
  }
}
