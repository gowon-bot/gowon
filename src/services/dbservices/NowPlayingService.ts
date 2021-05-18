import { NowPlayingConfig } from "../../database/entity/NowPlayingConfig";
import { User } from "../../database/entity/User";
import { sortConfigOptions } from "../../lib/nowplaying/componentMap";
import { BaseService } from "../BaseService";

export class ConfigService extends BaseService {
  async getConfigForUser(user: User): Promise<string[]> {
    const config = await this.getOrCreateConfig(user);
    return sortConfigOptions(config.config);
  }

  async saveConfigForUser(user: User, config: string[]) {
    const dbConfig = await this.getOrCreateConfig(user);

    dbConfig.config = config;

    return await dbConfig.save();
  }

  private async getOrCreateConfig(user: User): Promise<NowPlayingConfig> {
    const existing = await NowPlayingConfig.findOne({ where: { user } });

    if (existing) return existing;

    const newConfig = NowPlayingConfig.create({ user, config: [] });

    return await newConfig.save();
  }
}
