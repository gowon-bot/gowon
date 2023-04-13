import { AnalyticsCollector } from "../analytics/AnalyticsCollector";
import { DatasourceService } from "../lib/nowplaying/DatasourceService";
import { PermissionsCacheService } from "../lib/permissions/PermissionsCacheService";
import { PermissionsService } from "../lib/permissions/PermissionsService";
import { SettingsService } from "../lib/settings/SettingsService";
import { BaseService } from "./BaseService";
import { ConcurrencyService } from "./ConcurrencyService";
import { DiscordService } from "./Discord/DiscordService";
import { EmojiService } from "./Discord/EmojiService";
import { GuildEventService } from "./Discord/GuildEventService";
import { NicknameService } from "./Discord/NicknameService";
import { WhoKnowsService } from "./Discord/WhoKnowsService";
import { GithubService } from "./Github/GithubService";
import { GowonService } from "./GowonService";
import { LastFMArguments } from "./LastFM/LastFMArguments";
import { LastFMService } from "./LastFM/LastFMService";
import { NowPlayingEmbedParsingService } from "./NowPlayingEmbedParsingService";
import { SpotifyArguments } from "./Spotify/SpotifyArguments";
import { SpotifyAuthenticationService } from "./Spotify/SpotifyAuthenticationService";
import { SpotifyPlaylistTagService } from "./Spotify/SpotifyPlaylistTagService";
import { SpotifyService } from "./Spotify/SpotifyService";
import { TimeAndDateService } from "./TimeAndDateService";
import { TrackingService } from "./TrackingService";
import { WordBlacklistService } from "./WordBlacklistService";
import { ArgumentParsingService } from "./arguments/ArgumentsParsingService";
import { MentionsService } from "./arguments/mentions/MentionsService";
import { BotStatsService } from "./dbservices/BotStatsService";
import { CardsService } from "./dbservices/CardsService";
import { ComboService } from "./dbservices/ComboService";
import { FriendsService } from "./dbservices/FriendsService";
import { MetaService } from "./dbservices/MetaService";
import { ConfigService } from "./dbservices/NowPlayingService";
import { RedirectsService } from "./dbservices/RedirectsService";
import { UsersService } from "./dbservices/UsersService";
import { CrownsHistoryService } from "./dbservices/crowns/CrownsHistoryService";
import { CrownsService } from "./dbservices/crowns/CrownsService";
import { CrownsUserService } from "./dbservices/crowns/CrownsUserService";
import { FishyService } from "./fishy/FishyService";
import { LilacAPIService } from "./lilac/LilacAPIService";
import { LilacArtistsService } from "./lilac/LilacArtistsService";
import { LilacLibraryService } from "./lilac/LilacLibraryService";
import { LilacTagsService } from "./lilac/LilacTagsService";
import { LilacUsersService } from "./lilac/LilacUsersService";
import { LilacWhoKnowsService } from "./lilac/LilacWhoKnowsService";
import { MirrorballService } from "./mirrorball/MirrorballService";
import { ArtistsService } from "./mirrorball/services/ArtistsService";
import { MirrorballUsersService } from "./mirrorball/services/MirrorballUsersService";
import { AlbumCoverService } from "./moderation/AlbumCoverService";
import { ChartService } from "./pantomime/ChartService";
import { RedisInteractionService } from "./redis/RedisInteractionService";
import { RedisService } from "./redis/RedisService";
import { TasteService } from "./taste/TasteService";

export type Service<T extends BaseService = any> = { new (): T };

const services: Service[] = [
  AlbumCoverService,
  AnalyticsCollector,
  ArgumentParsingService,
  ArtistsService,
  BotStatsService,
  CardsService,
  ChartService,
  CrownsService,
  CrownsHistoryService,
  CrownsUserService,
  ComboService,
  ConcurrencyService,
  ConfigService,
  DatasourceService,
  DiscordService,
  EmojiService,
  FishyService,
  FriendsService,
  GowonService,
  GithubService,
  GuildEventService,
  LastFMService,
  LastFMArguments,

  // Lilac services
  LilacAPIService,
  LilacArtistsService,
  LilacLibraryService,
  LilacTagsService,
  LilacUsersService,
  LilacWhoKnowsService,

  MetaService,
  MentionsService,
  MirrorballService,
  MirrorballUsersService,
  NicknameService,
  NowPlayingEmbedParsingService,
  PermissionsService,
  PermissionsCacheService,
  RedirectsService,
  RedisService,
  RedisInteractionService,
  SettingsService,
  SpotifyService,
  SpotifyArguments,
  SpotifyAuthenticationService,
  SpotifyPlaylistTagService,
  TasteService,
  TimeAndDateService,
  TrackingService,
  UsersService,
  WhoKnowsService,
  WordBlacklistService,
];

export class ServiceRegistry {
  static services: { constructor: Function; mocks?: string }[];

  static setServices(servicePool = services) {
    this.services = servicePool
      .map((s) => {
        if (!s) return undefined;

        return new s();
      })
      .filter((s) => !!s);
  }

  static get<T extends BaseService>(service: Service<T>): T {
    const foundService = this.services.find(
      (s) => (s.mocks || s.constructor.name) === service.name
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
