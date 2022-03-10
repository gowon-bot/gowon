import { SimpleMap } from "../helpers/types";
import { ConcurrencyService } from "./ConcurrencyService";
import { DatasourceService } from "../lib/nowplaying/DatasourceService";
import { Can } from "../lib/permissions/Can";
import { AdminService } from "./dbservices/AdminService";
import { BotStatsService } from "./dbservices/BotStatsService";
import { ComboService } from "./dbservices/ComboService";
import { CrownsHistoryService } from "./dbservices/CrownsHistoryService";
import { CrownsService } from "./dbservices/CrownsService";
import { FriendsService } from "./dbservices/FriendsService";
import { MetaService } from "./dbservices/MetaService";
import { ConfigService } from "./dbservices/NowPlayingService";
import { RedirectsService } from "./dbservices/RedirectsService";
import { UsersService } from "./dbservices/UsersService";
import { GithubService } from "./Github/GithubService";
import { GowonService } from "./GowonService";
import { GuildEventService } from "./Discord/GuildEventService";
import { NicknameService } from "./Discord/NicknameService";
import { WhoKnowsService } from "./Discord/WhoKnowsService";
import { LastFMArguments } from "./LastFM/LastFMArguments";
import { LastFMService } from "./LastFM/LastFMService";
import { MirrorballCacheService } from "./mirrorball/MirrorballCacheService";
import { MirrorballService } from "./mirrorball/MirrorballService";
import { ArtistsService } from "./mirrorball/services/ArtistsService";
import { MirrorballUsersService } from "./mirrorball/services/MirrorballUsersService";
import { TagsService } from "./mirrorball/services/TagsService";
import { PM2Service } from "./PM2Service";
import { RedisInteractionService } from "./redis/RedisInteractionService";
import { RedisService } from "./redis/RedisService";
import { SpotifyService } from "./Spotify/SpotifyService";
import { TrackingService } from "./TrackingService";
import { SettingsService } from "../lib/settings/SettingsService";
import { AnalyticsCollector } from "../analytics/AnalyticsCollector";
import { WordBlacklistService } from "./WordBlacklistService";
import { RollbarService } from "./Rollbar/RollbarService";
import { NowPlayingEmbedParsingService } from "./NowPlayingEmbedParsingService";
import { ChartService } from "./pantomime/ChartService";
import { EmojiService } from "./Discord/EmojiService";
import { ArgumentParsingService } from "./arguments/ArgumentsParsingService";
import { DiscordService } from "./Discord/DiscordService";
import { SpotifyAuthenticationService } from "./Spotify/SpotifyAuthenticationService";
import { SpotifyArguments } from "./Spotify/SpotifyArguments";
import { SpotifyPlaylistTagService } from "./Spotify/SpotifyPlaylistTagService";
import { TwitterService } from "./Twitter/TwitterService";
import { Responder } from "./Responder";

type Service<T = any> = { new (): T };

export type Context = SimpleMap<any>;

const services: Service[] = [
  AdminService,
  AnalyticsCollector,
  ArgumentParsingService,
  ArtistsService,
  BotStatsService,
  Can,
  ChartService,
  CrownsService,
  CrownsHistoryService,
  ComboService,
  ConcurrencyService,
  ConfigService,
  DatasourceService,
  DiscordService,
  EmojiService,
  FriendsService,
  GowonService,
  GithubService,
  GuildEventService,
  LastFMService,
  LastFMArguments,
  MetaService,
  MirrorballService,
  MirrorballCacheService,
  MirrorballUsersService,
  NicknameService,
  NowPlayingEmbedParsingService,
  PM2Service,
  RedirectsService,
  RedisService,
  RedisInteractionService,
  Responder,
  RollbarService,
  SettingsService,
  SpotifyService,
  SpotifyArguments,
  SpotifyAuthenticationService,
  SpotifyPlaylistTagService,
  TagsService,
  TrackingService,
  TwitterService,
  UsersService,
  WhoKnowsService,
  WordBlacklistService,
];

export class ServiceRegistry {
  static services: { constructor: Function }[];

  static setServices() {
    console.log("Setting services...");

    this.services = services
      .map((s) => {
        if (!s) return undefined;

        return new s();
      })
      .filter((s) => !!s);

    console.log("Set services!");
  }

  static get<T>(service: Service<T>): T {
    const foundService = this.services.find(
      (s) => s.constructor.name === service.name
    );

    if (!foundService) {
      throw new MissingServiceError(service.name);
    }

    return foundService as T;
  }
}

class MissingServiceError extends Error {
  constructor(serviceName: string) {
    super(`Couldn't find service: ${serviceName}`);
  }
}
