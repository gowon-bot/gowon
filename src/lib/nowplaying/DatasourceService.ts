import { Message } from "discord.js";
import { User } from "../../database/entity/User";
import { BaseService } from "../../services/BaseService";
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
}

export type Resources = InputResources & {
  logger?: Logger;
  requirements: NowPlayingRequirement[];
};

export class DatasourceService extends BaseService {
  lastFMService = new LastFMService(this.logger);
  mirrorballService = new MirrorballService(this.logger);
  crownsService = new CrownsService(this.logger);

  resources!: Resources;

  private get nowPlaying(): RecentTrack {
    return this.resources.recentTracks.first();
  }

  async resolveRequirements(
    requirements: NowPlayingRequirement[],
    resources: InputResources
  ): Promise<ResolvedRequirements> {
    this.resources = Object.assign(resources, {
      logger: this.logger,
      requirements,
    });

    const graphQLDatasource = new GraphQLDatasource();

    const resolvers = [] as Promise<any>[];
    const resolverNames = [] as string[];

    for (const key of Object.getOwnPropertyNames(DatasourceService.prototype)) {
      const data = (this as any)[key];

      if (requirements.includes(key as NowPlayingRequirement)) {
        const resolvedData = data.bind(this)();

        if (isQueryPart(resolvedData)) {
          graphQLDatasource.addPart(resolvedData);
        } else {
          resolvers.push(resolvedData);
          resolverNames.push(key);
        }
      }
    }

    if (graphQLDatasource.hasAnyParts()) {
      resolvers.push(graphQLDatasource.asResolver(this)());
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

  async artistInfo(): Promise<ArtistInfo | undefined> {
    try {
      const nowPlaying = this.nowPlaying;

      return await this.lastFMService.artistInfo({
        artist: nowPlaying.artist,
        username: this.resources.requestable,
      });
    } catch {
      return undefined;
    }
  }

  async trackInfo(): Promise<TrackInfo | undefined> {
    try {
      return await this.lastFMService.trackInfo({
        artist: this.nowPlaying.artist,
        track: this.nowPlaying.name,
        username: this.resources.requestable,
      });
    } catch {
      return undefined;
    }
  }

  async artistCrown(): Promise<CrownDisplay | undefined> {
    try {
      return await this.crownsService.getCrownDisplay(
        this.nowPlaying.artist,
        this.resources.message.guild!
      );
    } catch {
      return undefined;
    }
  }

  albumPlays(): QueryPart {
    const user: UserInput = { discordID: this.resources.dbUser.discordID };
    const lpSettings = {
      album: {
        name: this.nowPlaying.album,
        artist: { name: this.nowPlaying.artist },
      },
    };

    return { query: "albumPlays", variables: { user, lpSettings } };
  }

  artistPlays(): QueryPart {
    const user: UserInput = { discordID: this.resources.dbUser.discordID };
    const apSettings = {
      artist: { name: this.nowPlaying.artist },
    };

    return { query: "artistPlays", variables: { user, apSettings } };
  }

  albumRating(): QueryPart {
    const user: UserInput = { discordID: this.resources.dbUser.discordID };
    const lrAlbum = {
      name: this.nowPlaying.album,
      artist: { name: this.nowPlaying.artist },
    };

    return { query: "albumRating", variables: { user, lrAlbum } };
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
    datasourceService: DatasourceService
  ): (..._: any[]) => Promise<any> {
    const { query, variables } = buildQuery(this.parts);

    return async () => ({
      graphQLData: await datasourceService.mirrorballService.query(
        query,
        variables
      ),
    });
  }
}
