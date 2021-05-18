import { Message } from "discord.js";
import { User } from "../../database/entity/User";
import { BaseService } from "../../services/BaseService";
import {
  CrownDisplay,
  CrownsService,
} from "../../services/dbservices/CrownsService";
import { IndexingService } from "../../services/indexing/IndexingService";
import { UserInput } from "../../services/indexing/IndexingTypes";
import { LastFMService } from "../../services/LastFM/LastFMService";
import {
  ArtistInfo,
  RecentTracksResponse,
  Track,
  TrackInfo,
} from "../../services/LastFM/LastFMService.types";
import { buildQuery, isQueryPart, QueryPart } from "./buildQuery";
import { NowPlayingRequirement } from "./components/BaseNowPlayingComponent";

export interface ResolvedRequirements {
  [requirement: string]: any;
}

export interface Resources {
  recentTracks: RecentTracksResponse;
  message: Message;
  username: string;
  dbUser: User;
}

export class DatasourceService extends BaseService {
  lastFMService = new LastFMService(this.logger);
  indexingService = new IndexingService(this.logger);
  crownsService = new CrownsService(this.logger);

  resources!: Resources;

  private get nowPlaying(): Track {
    return this.resources.recentTracks.recenttracks.track[0];
  }

  async resolveRequirements(
    requirements: NowPlayingRequirement[],
    resources: Resources
  ): Promise<ResolvedRequirements> {
    this.resources = resources;

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

  async artistInfo(): Promise<ArtistInfo> {
    const nowPlaying = this.nowPlaying;

    return await this.lastFMService.artistInfo({
      artist: nowPlaying.artist["#text"],
      username: this.resources.username,
    });
  }

  async trackInfo(): Promise<TrackInfo> {
    return await this.lastFMService.trackInfo({
      artist: this.nowPlaying.artist["#text"],
      track: this.nowPlaying.name,
      username: this.resources.username,
    });
  }

  async artistCrown(): Promise<CrownDisplay | undefined> {
    return await this.crownsService.getCrownDisplay(
      this.nowPlaying.artist["#text"],
      this.resources.message.guild!
    );
  }

  albumPlays(): QueryPart {
    const user: UserInput = { lastFMUsername: this.resources.username };
    const lpSettings = {
      album: {
        name: this.nowPlaying.album["#text"],
        artist: { name: this.nowPlaying.artist["#text"] },
      },
    };

    return { query: "albumPlays", variables: { user, lpSettings } };
  }

  artistPlays(): QueryPart {
    const user: UserInput = { lastFMUsername: this.resources.username };
    const apSettings = {
      artist: { name: this.nowPlaying.artist["#text"] },
    };

    return { query: "artistPlays", variables: { user, apSettings } };
  }

  albumRating(): QueryPart {
    const user: UserInput = { discordID: this.resources.dbUser.discordID };
    const lrAlbum = {
      name: this.nowPlaying.album["#text"],
      artist: { name: this.nowPlaying.artist["#text"] },
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
      graphQLData: await datasourceService.indexingService.genericRequest(
        query,
        variables
      ),
    });
  }
}
