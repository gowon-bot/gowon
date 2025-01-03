import { AnalyticsCollector } from "../analytics/AnalyticsCollector";
import { DatasourceService } from "../lib/nowplaying/DatasourceService";
import { PermissionsCacheService } from "../lib/permissions/PermissionsCacheService";
import { PermissionsService } from "../lib/permissions/PermissionsService";
import { SettingsService } from "../lib/settings/SettingsService";
import { BaseService } from "./BaseService";
import { DiscordService } from "./Discord/DiscordService";
import { EmojiService } from "./Discord/EmojiService";
import { GuildEventService } from "./Discord/GuildEventService";
import { NicknameService } from "./Discord/NicknameService";
import { WhoKnowsService } from "./Discord/WhoKnowsService";
import { GithubService } from "./Github/GithubService";
import { GowonService } from "./GowonService";
import { LastFMArguments } from "./LastFM/LastFMArguments";
import { LastFMService } from "./LastFM/LastFMService";
import { LovedTrackService } from "./LastFM/LovedTrackService";
import { NowPlayingEmbedParsingService } from "./NowPlayingEmbedParsingService";
import { SpotifyArguments } from "./Spotify/SpotifyArguments";
import { SpotifyAuthenticationService } from "./Spotify/SpotifyAuthenticationService";
import { SpotifyPlaylistTagService } from "./Spotify/SpotifyPlaylistTagService";
import { SpotifyService } from "./Spotify/SpotifyService";
import { TimeAndDateService } from "./TimeAndDateService";
import { TrackingService } from "./TrackingService";
import { WordBlacklistService } from "./WordBlacklistService";
import { ErrorReportingService } from "./analytics/ErrorReportingService";
import { ArgumentParsingService } from "./arguments/ArgumentsParsingService";
import { MentionsService } from "./arguments/mentions/MentionsService";
import { BotStatsService } from "./dbservices/BotStatsService";
import { CardsService } from "./dbservices/CardsService";
import { ComboService } from "./dbservices/ComboService";
import { FriendsService } from "./dbservices/FriendsService";
import { MetaService } from "./dbservices/MetaService";
import { NowPlayingService } from "./dbservices/NowPlayingService";
import { RedirectsService } from "./dbservices/RedirectsService";
import { UsersService } from "./dbservices/UsersService";
import { CrownsHistoryService } from "./dbservices/crowns/CrownsHistoryService";
import { CrownsService } from "./dbservices/crowns/CrownsService";
import { CrownsUserService } from "./dbservices/crowns/CrownsUserService";
import { FishyService } from "./fishy/FishyService";
import { FishyProgressionService } from "./fishy/quests/FishyProgressionService";
import { IntervaledJobsService } from "./intervaledJobs/IntervaledJobsService";
import { LilacAPIService } from "./lilac/LilacAPIService";
import { LilacAlbumsService } from "./lilac/LilacAlbumsService";
import { LilacArtistsService } from "./lilac/LilacArtistsService";
import { LilacGuildsService } from "./lilac/LilacGuildsService";
import { LilacLibraryService } from "./lilac/LilacLibraryService";
import { LilacRatingsService } from "./lilac/LilacRatingsService";
import { LilacTagsService } from "./lilac/LilacTagsService";
import { LilacTracksService } from "./lilac/LilacTracksService";
import { LilacUsersService } from "./lilac/LilacUsersService";
import { LilacWhoKnowsService } from "./lilac/LilacWhoKnowsService";
import { MirrorballService } from "./mirrorball/MirrorballService";
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
  BotStatsService,
  CardsService,
  ChartService,
  CrownsService,
  CrownsHistoryService,
  CrownsUserService,
  ComboService,
  DatasourceService,
  DiscordService,
  EmojiService,
  FishyService,
  FishyProgressionService,
  FriendsService,
  GowonService,
  GithubService,
  GuildEventService,
  IntervaledJobsService,
  LastFMService,
  LastFMArguments,

  // Lilac services
  LilacAPIService,
  LilacArtistsService,
  LilacAlbumsService,
  LilacGuildsService,
  LilacLibraryService,
  LilacRatingsService,
  LilacTagsService,
  LilacTracksService,
  LilacUsersService,
  LilacWhoKnowsService,

  LovedTrackService,
  MetaService,
  MentionsService,
  MirrorballService,
  NicknameService,
  NowPlayingService,
  NowPlayingEmbedParsingService,
  PermissionsService,
  PermissionsCacheService,
  RedirectsService,
  RedisService,
  RedisInteractionService,
  ErrorReportingService,
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
