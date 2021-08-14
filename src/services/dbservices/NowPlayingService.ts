import { NowPlayingConfig } from "../../database/entity/NowPlayingConfig";
import { User } from "../../database/entity/User";
import { sortConfigOptions } from "../../lib/nowplaying/componentMap";
import { BaseService } from "../BaseService";

export const UNUSED_CONFIG = "unused";

export class ConfigService extends BaseService {
  async getConfigForUser(user: User): Promise<string[]> {
    this.log(`Fetching config for user ${user.discordID}`);

    const config = await this.getOrCreateConfig(user);
    return sortConfigOptions(config.config);
  }

  async getConfigNoUnused(user: User) {
    return (await this.getConfigForUser(user)).filter(
      (c) => c !== UNUSED_CONFIG
    );
  }

  async saveConfigForUser(user: User, config: string[]) {
    this.log(`Saving config for user ${user.discordID} (${config.join(", ")})`);

    const dbConfig = await this.getOrCreateConfig(user);

    dbConfig.config = config;

    return await dbConfig.save();
  }

  private async getOrCreateConfig(user: User): Promise<NowPlayingConfig> {
    this.log(`Fetching or creating config for user ${user.discordID}`);

    const existing = await NowPlayingConfig.findOne({ where: { user } });

    if (existing) return existing;

    const newConfig = NowPlayingConfig.create({
      user,
      config: [UNUSED_CONFIG],
    });

    return await newConfig.save();
  }
}
