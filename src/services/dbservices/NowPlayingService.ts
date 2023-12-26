import { NowPlayingConfig } from "../../database/entity/NowPlayingConfig";
import { User } from "../../database/entity/User";
import { requestableAsUsername } from "../../lib/MultiRequester";
import { GowonContext } from "../../lib/context/Context";
import { DatasourceService } from "../../lib/nowplaying/DatasourceService";
import { DependencyMap } from "../../lib/nowplaying/DependencyMap";
import { NowPlayingBuilder } from "../../lib/nowplaying/NowPlayingBuilder";
import { RenderedComponent } from "../../lib/nowplaying/base/BaseNowPlayingComponent";
import {
  NowPlayingComponent,
  componentMap,
  sortConfigOptions,
} from "../../lib/nowplaying/componentMap";
import { FMUsernameDisplay } from "../../lib/settings/SettingValues";
import { SettingsService } from "../../lib/settings/SettingsService";
import { displayUserTag } from "../../lib/ui/displays";
import { BaseService } from "../BaseService";
import { DiscordService } from "../Discord/DiscordService";
import { Requestable } from "../LastFM/LastFMAPIService";
import { RecentTracks } from "../LastFM/converters/RecentTracks";
import { ServiceRegistry } from "../ServicesRegistry";

export const UNUSED_CONFIG = "unused";

export class NowPlayingService extends BaseService {
  public static readonly presets = {
    blank: [],
    default: ["artist-plays", "artist-tags", "scrobbles", "artist-crown"],
    verbose: [
      "artist-plays",
      "track-plays",
      "artist-tags",
      "track-tags",
      "artist-crown",
      "loved",
    ],
    all: Object.keys(componentMap),
  };

  private get datasourceService() {
    return ServiceRegistry.get(DatasourceService);
  }

  private get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }

  private get discordService() {
    return ServiceRegistry.get(DiscordService);
  }

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

  public async renderComponents(
    ctx: GowonContext,
    config: string[],
    recentTracks: RecentTracks,
    requestable: Requestable,
    dbUser: User,
    extras: {
      components?: NowPlayingComponent[];
      dependencies?: Record<string, any>;
    } = {}
  ): Promise<RenderedComponent[]> {
    const builder = new NowPlayingBuilder(config);

    builder.components.push(...(extras.components || []));

    const dependencies =
      builder.generateDependencies() as (keyof DependencyMap)[];

    const resolvedDependencies =
      await this.datasourceService.resolveDependencies(ctx, dependencies, {
        recentTracks,
        requestable,
        username: requestableAsUsername(requestable),
        dbUser,
        payload: ctx.payload,
        components: config,
        prefix: ctx.command.prefix,
        ...(extras.dependencies || {}),
      });

    const components = await builder.renderComponents(resolvedDependencies);

    return components;
  }

  public async getUsernameDisplay(
    ctx: GowonContext,
    dbUser: User,
    username: string
  ): Promise<string> {
    const usernameDisplay =
      this.settingsService.get("fmUsernameDisplay", {
        userID: dbUser.discordID,
      }) || FMUsernameDisplay.LAST_FM_USERNAME;

    return usernameDisplay === FMUsernameDisplay.LAST_FM_USERNAME
      ? username
      : displayUserTag(
          await this.discordService.fetchUser(ctx, dbUser.discordID)
        );
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
