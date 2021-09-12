import { SimpleMap } from "../helpers/types";
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
import { GuildEventService } from "./guilds/GuildEventService";
import { NicknameService } from "./guilds/NicknameService";
import { WhoKnowsService } from "./guilds/WhoKnowsService";
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

type Service<T = any> = { new (): T };

export type Context = SimpleMap<any>;

const services: Service[] = [
  AdminService,
  ArtistsService,
  BotStatsService,
  Can,
  CrownsService,
  CrownsHistoryService,
  ComboService,
  ConfigService,
  DatasourceService,
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
  PM2Service,
  RedirectsService,
  RedisService,
  RedisInteractionService,
  SpotifyService,
  TagsService,
  TrackingService,
  UsersService,
  WhoKnowsService,
];

export class ServiceRegistry {
  static services: { constructor: Function }[];

  static setServices() {
    this.services = services
      .map((s) => {
        if (!s) return undefined;

        return new s();
      })
      .filter((s) => !!s);
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
