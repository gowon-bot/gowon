import { CachedLovedTrack } from "../../database/entity/CachedLovedTrack";
import { User } from "../../database/entity/User";
import { AlbumCard } from "../../database/entity/cards/AlbumCard";
import { FishyProfile } from "../../database/entity/fishy/FishyProfile";
import { BaseService } from "../../services/BaseService";
import { Requestable } from "../../services/LastFM/LastFMAPIService";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { LovedTrackService } from "../../services/LastFM/LovedTrackService";
import {
  ArtistInfo,
  TrackInfo,
} from "../../services/LastFM/converters/InfoTypes";
import {
  RecentTrack,
  RecentTracks,
} from "../../services/LastFM/converters/RecentTracks";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { CardsService } from "../../services/dbservices/CardsService";
import { CrownsService } from "../../services/dbservices/crowns/CrownsService";
import { CrownDisplay } from "../../services/dbservices/crowns/CrownsService.types";
import { FishyService } from "../../services/fishy/FishyService";
import { MirrorballService } from "../../services/mirrorball/MirrorballService";
import { UserInput } from "../../services/mirrorball/MirrorballTypes";
import { Logger } from "../Logger";
import { GowonContext } from "../context/Context";
import { Payload } from "../context/Payload";
import { TagConsolidator } from "../tags/TagConsolidator";
import { NowPlayingDependency } from "./base/BaseNowPlayingComponent";
import { QueryPart, buildQuery, isQueryPart } from "./buildQuery";

export interface ResolvedDependencies {
  [dependency: string]: any;
}

export interface InputResources {
  recentTracks: RecentTracks;
  payload: Payload;
  requestable: Requestable;
  username: string;
  dbUser: User;
  components: string[];
  prefix: string;
}

export type Resources = InputResources & {
  logger?: Logger;
  dependencies: NowPlayingDependency[];
};

export type DatasourceServiceContext = GowonContext<{
  constants?: { resources?: Resources };
  mutable?: { tagConsolidator?: TagConsolidator };
}>;

export class DatasourceService extends BaseService<DatasourceServiceContext> {
  get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }
  get mirrorballService() {
    return ServiceRegistry.get(MirrorballService);
  }
  get crownsService() {
    return ServiceRegistry.get(CrownsService);
  }
  get cardsService() {
    return ServiceRegistry.get(CardsService);
  }
  get fishyService() {
    return ServiceRegistry.get(FishyService);
  }
  get lovedTrackService() {
    return ServiceRegistry.get(LovedTrackService);
  }

  private nowPlaying(ctx: DatasourceServiceContext): RecentTrack {
    return ctx.constants.resources!.recentTracks.first();
  }

  async resolveDependencies(
    ctx: DatasourceServiceContext,
    dependencies: NowPlayingDependency[],
    resources: InputResources
  ): Promise<ResolvedDependencies> {
    ctx.constants.resources = Object.assign(resources, {
      logger: ctx.logger,
      dependencies: dependencies,
    });

    const graphQLDatasource = new GraphQLDatasource();

    const resolvers = [] as Promise<any>[];
    const resolverNames = [] as string[];

    for (const key of Object.getOwnPropertyNames(DatasourceService.prototype)) {
      const data = (this as any)[key];

      if (dependencies.includes(key as NowPlayingDependency)) {
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

    const resolvedMap = resolved.reduce((acc, val, idx) => {
      if (val?.graphQLData) {
        return Object.assign(acc, val.graphQLData);
      }

      const datasourceName = resolverNames[idx];

      acc[datasourceName] = val;

      return acc;
    }, {} as ResolvedDependencies);

    return Object.assign(resolvedMap, resources);
  }

  async artistInfo(
    ctx: DatasourceServiceContext
  ): Promise<ArtistInfo | undefined> {
    try {
      const np = this.nowPlaying(ctx);

      const artistInfo = await this.lastFMService.artistInfo(ctx, {
        artist: np.artist,
        username: ctx.constants.resources!.requestable,
      });

      await this.addTagsToConsolidator(ctx, artistInfo.tags);

      return artistInfo;
    } catch {
      return undefined;
    }
  }

  async trackInfo(
    ctx: DatasourceServiceContext
  ): Promise<TrackInfo | undefined> {
    try {
      const trackInfo = await this.lastFMService.trackInfo(ctx, {
        artist: this.nowPlaying(ctx).artist,
        track: this.nowPlaying(ctx).name,
        username: ctx.constants.resources!.requestable,
      });

      await this.addTagsToConsolidator(ctx, trackInfo.tags);

      return trackInfo;
    } catch {
      return undefined;
    }
  }

  async artistCrown(
    ctx: DatasourceServiceContext
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

  async albumCard(
    ctx: DatasourceServiceContext
  ): Promise<AlbumCard | undefined> {
    const np = this.nowPlaying(ctx);

    return await this.cardsService.getCard(ctx, np.artist, np.album);
  }

  async fishyProfile(
    ctx: DatasourceServiceContext
  ): Promise<FishyProfile | undefined> {
    return await this.fishyService.getFishyProfile(
      ctx.constants.resources!.dbUser,
      false
    );
  }

  async cachedLovedTrack(
    ctx: DatasourceServiceContext
  ): Promise<CachedLovedTrack | undefined> {
    const np = this.nowPlaying(ctx);

    return await this.lovedTrackService.getCachedLovedTrack(
      ctx,
      {
        artist: np.artist,
        track: np.name,
        username: ctx.constants.resources!.dbUser.asRequestable(),
      },
      ctx.constants.resources!.dbUser
    );
  }

  albumPlays(ctx: DatasourceServiceContext): QueryPart {
    const user: UserInput = {
      discordID: ctx.constants.resources!.dbUser.discordID,
    };
    const lpSettings = {
      album: {
        name: this.nowPlaying(ctx).album,
        artist: { name: this.nowPlaying(ctx).artist },
      },
    };

    return { query: "albumPlays", variables: { user, lpSettings } };
  }

  artistPlays(ctx: DatasourceServiceContext): QueryPart {
    const user: UserInput = {
      discordID: ctx.constants.resources!.dbUser.discordID,
    };
    const apSettings = {
      artist: { name: this.nowPlaying(ctx).artist },
    };

    return { query: "artistPlays", variables: { user, apSettings } };
  }

  albumRating(ctx: DatasourceServiceContext): QueryPart {
    const user: UserInput = {
      discordID: ctx.constants.resources!.dbUser.discordID,
    };
    const lrAlbum = {
      name: this.nowPlaying(ctx).album,
      artist: { name: this.nowPlaying(ctx).artist },
    };

    return { query: "albumRating", variables: { user, lrAlbum } };
  }

  globalArtistRank(ctx: DatasourceServiceContext): QueryPart {
    const user: UserInput = {
      discordID: ctx.constants.resources!.dbUser.discordID,
    };

    const arArtist = { name: this.nowPlaying(ctx).artist };

    return { query: "globalArtistRank", variables: { user, arArtist } };
  }

  serverArtistRank(ctx: DatasourceServiceContext): QueryPart {
    const user: UserInput = {
      discordID: ctx.constants.resources!.dbUser.discordID,
    };
    const arArtist = { name: this.nowPlaying(ctx).artist };

    return {
      query: "serverArtistRank",
      variables: {
        user,
        arArtist,
        serverID: ctx.constants.resources!.payload.guild?.id,
      },
    };
  }

  private async addTagsToConsolidator(
    ctx: DatasourceServiceContext,
    tags: string[]
  ) {
    if (!ctx.mutable.tagConsolidator) {
      ctx.mutable.tagConsolidator = new TagConsolidator();
      await ctx.mutable.tagConsolidator.saveServerBannedTagsInContext(ctx);
    }

    ctx.mutable.tagConsolidator.addTags(ctx, tags);
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
    ctx: DatasourceServiceContext,
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
