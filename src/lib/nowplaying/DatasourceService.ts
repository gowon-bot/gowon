import { Message } from "discord.js";
import { User } from "../../database/entity/User";
import { BaseService, BaseServiceContext } from "../../services/BaseService";
import {
  CrownDisplay,
  CrownsService,
} from "../../services/dbservices/CrownsService";
import { MirrorballService } from "../../services/mirrorball/MirrorballService";
import { UserInput } from "../../services/mirrorball/MirrorballTypes";
import {
  ArtistInfo,
  TrackInfo,
} from "../../services/LastFM/converters/InfoTypes";
import {
  RecentTrack,
  RecentTracks,
} from "../../services/LastFM/converters/RecentTracks";
import { Requestable } from "../../services/LastFM/LastFMAPIService";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { buildQuery, isQueryPart, QueryPart } from "./buildQuery";
import { NowPlayingRequirement } from "./components/BaseNowPlayingComponent";
import { Logger } from "../Logger";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export interface ResolvedRequirements {
  [requirement: string]: any;
}

export interface InputResources {
  recentTracks: RecentTracks;
  message: Message;
  requestable: Requestable;
  username: string;
  dbUser: User;
  components: string[];
  prefix: string;
}

export type Resources = InputResources & {
  logger?: Logger;
  requirements: NowPlayingRequirement[];
};

type MutableDatasourceServiceContext = {
  resources?: Resources;
};

export class DatasourceService extends BaseService<
  BaseServiceContext,
  MutableDatasourceServiceContext
> {
  get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }
  get mirrorballService() {
    return ServiceRegistry.get(MirrorballService);
  }
  get crownsService() {
    return ServiceRegistry.get(CrownsService);
  }

  private nowPlaying(
    ctx: BaseServiceContext & MutableDatasourceServiceContext
  ): RecentTrack {
    return ctx.resources!.recentTracks.first();
  }

  async resolveRequirements(
    ctx: BaseServiceContext & MutableDatasourceServiceContext,
    requirements: NowPlayingRequirement[],
    resources: InputResources
  ): Promise<ResolvedRequirements> {
    ctx.resources = Object.assign(resources, {
      logger: ctx.logger,
      requirements,
    });

    const graphQLDatasource = new GraphQLDatasource();

    const resolvers = [] as Promise<any>[];
    const resolverNames = [] as string[];

    for (const key of Object.getOwnPropertyNames(DatasourceService.prototype)) {
      const data = (this as any)[key];

      if (requirements.includes(key as NowPlayingRequirement)) {
        const resolvedData = data.bind(this)(ctx);

        if (isQueryPart(resolvedData)) {
          graphQLDatasource.addPart(resolvedData);
        } else {
          resolvers.push(resolvedData);
          resolverNames.push(key);
        }
      }
    }

    if (graphQLDatasource.hasAnyParts()) {
      resolvers.push(graphQLDatasource.asResolver(ctx, this)());
    }

    const resolved = await Promise.all(resolvers);

    let resolvedMap = resolved.reduce((acc, val, idx) => {
      if (val?.graphQLData) {
        return Object.assign(acc, val.graphQLData);
      }

      const datasourceName = resolverNames[idx];

      acc[datasourceName] = val;

      return acc;
    }, {} as ResolvedRequirements);

    resolvedMap = Object.assign(resolvedMap, resources);

    return resolvedMap;
  }

  async artistInfo(
    ctx: BaseServiceContext & MutableDatasourceServiceContext
  ): Promise<ArtistInfo | undefined> {
    try {
      const nowPlaying = this.nowPlaying;

      return await this.lastFMService.artistInfo(ctx, {
        artist: nowPlaying(ctx).artist,
        username: ctx.resources!.requestable,
      });
    } catch {
      return undefined;
    }
  }

  async trackInfo(
    ctx: BaseServiceContext & MutableDatasourceServiceContext
  ): Promise<TrackInfo | undefined> {
    try {
      return await this.lastFMService.trackInfo(ctx, {
        artist: this.nowPlaying(ctx).artist,
        track: this.nowPlaying(ctx).name,
        username: ctx.resources!.requestable,
      });
    } catch {
      return undefined;
    }
  }

  async artistCrown(
    ctx: BaseServiceContext & MutableDatasourceServiceContext
  ): Promise<CrownDisplay | undefined> {
    try {
      return await this.crownsService.getCrownDisplay(
        ctx,
        this.nowPlaying(ctx).artist
      );
    } catch {
      return undefined;
    }
  }

  albumPlays(
    ctx: BaseServiceContext & MutableDatasourceServiceContext
  ): QueryPart {
    const user: UserInput = { discordID: ctx.resources!.dbUser.discordID };
    const lpSettings = {
      album: {
        name: this.nowPlaying(ctx).album,
        artist: { name: this.nowPlaying(ctx).artist },
      },
    };

    return { query: "albumPlays", variables: { user, lpSettings } };
  }

  artistPlays(
    ctx: BaseServiceContext & MutableDatasourceServiceContext
  ): QueryPart {
    const user: UserInput = { discordID: ctx.resources!.dbUser.discordID };
    const apSettings = {
      artist: { name: this.nowPlaying(ctx).artist },
    };

    return { query: "artistPlays", variables: { user, apSettings } };
  }

  albumRating(
    ctx: BaseServiceContext & MutableDatasourceServiceContext
  ): QueryPart {
    const user: UserInput = { discordID: ctx.resources!.dbUser.discordID };
    const lrAlbum = {
      name: this.nowPlaying(ctx).album,
      artist: { name: this.nowPlaying(ctx).artist },
    };

    return { query: "albumRating", variables: { user, lrAlbum } };
  }

  globalArtistRank(
    ctx: BaseServiceContext & MutableDatasourceServiceContext
  ): QueryPart {
    const user: UserInput = { discordID: ctx.resources!.dbUser.discordID };
    const arArtist = { name: this.nowPlaying(ctx).artist };

    return { query: "globalArtistRank", variables: { user, arArtist } };
  }

  serverArtistRank(
    ctx: BaseServiceContext & MutableDatasourceServiceContext
  ): QueryPart {
    const user: UserInput = { discordID: ctx.resources!.dbUser.discordID };
    const arArtist = { name: this.nowPlaying(ctx).artist };

    return {
      query: "serverArtistRank",
      variables: { user, arArtist, serverID: ctx.resources!.message.guild?.id },
    };
  }
}

class GraphQLDatasource {
  private parts: QueryPart[] = [];

  hasAnyParts(): boolean {
    return !!this.parts.length;
  }

  addPart(part: QueryPart) {
    this.parts.push(part);
  }

  asResolver(
    ctx: BaseServiceContext,
    datasourceService: DatasourceService
  ): (..._: any[]) => Promise<any> {
    const { query, variables } = buildQuery(this.parts);

    return async () => ({
      graphQLData: await datasourceService.mirrorballService.query(
        ctx,
        query,
        variables
      ),
    });
  }
}
