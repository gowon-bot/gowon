import fetch, { Response } from "node-fetch";
import { BaseServiceContext } from "../BaseService";
import config from "../../../config.json";
import { URLSearchParams } from "url";
import { stringify } from "querystring";
import {
  PersonalSpotifyToken,
  RawSearchResponse,
  SpotifyCode,
  SpotifyEntityName,
  RawSpotifyTrack,
  SpotifyToken,
  RawSpotifyURI,
  RawSpotifyArtist,
  RawSpotifyAlbum,
  RawBaseSpotifyEntity,
  RawSpotifyItemCollection,
  RawSpotifyPlaylist,
  SpotifySnapshot,
} from "./SpotifyService.types";
import { SimpleMap } from "../../helpers/types";
import {
  NotAuthenticatedWithSpotifyError,
  SpotifyConnectionError,
} from "../../errors";
import { Logger } from "../../lib/Logger";
import { BaseSpotifyService } from "./BaseSpotifyService";
import {
  SpotifyAlbumSearch,
  SpotifyArtistSearch,
  SpotifyTrackSearch,
} from "./converters/Search";
import { SpotifyID, SpotifyURI } from "./converters/BaseConverter";
import { SpotifyTrack } from "./converters/Track";
import { SpotifyItemCollection } from "./converters/ItemCollection";
import { SpotifyPlaylist } from "./converters/Playlist";

export type SpotifyServiceContext = BaseServiceContext & {
  spotifyToken?: PersonalSpotifyToken;
};

interface SpotifyRequestOptions {
  path: string;
  params?: SimpleMap;
  method?: "POST" | "GET" | "PUT" | "DELETE";
  useBody?: boolean;
  expectNoContent?: boolean;
}

interface Keywords {
  keywords: string;
}

export type SpotifySearchParams<T extends object> = Keywords | T;

export function isKeywords(
  params: SpotifySearchParams<any>
): params is Keywords {
  return !!(params as Keywords).keywords;
}

export class SpotifyService extends BaseSpotifyService {
  private _token?: SpotifyToken;
  private tokenFetchedAt = new Date();

  generateURI<T extends SpotifyEntityName>(
    entity: T,
    id: string
  ): SpotifyURI<T> {
    return new SpotifyURI(`spotify:${entity}:${id}`);
  }

  private async token(ctx: BaseServiceContext): Promise<string> {
    if (this._token && this.tokenIsValid(this._token, this.tokenFetchedAt)) {
      return this._token.access_token;
    } else {
      const token = await this.fetchToken(ctx);
      this._token = token;
      return token.access_token;
    }
  }

  async fetchToken(
    ctx: BaseServiceContext,
    code?: SpotifyCode
  ): Promise<SpotifyToken> {
    this.log(ctx, "fetching new token");
    const params = new URLSearchParams();

    if (code) {
      params.append("grant_type", "authorization_code");
      params.append("redirect_uri", this.generateRedirectURI());
      params.append("code", code.code);
    } else {
      params.append("grant_type", "client_credentials");
    }

    const response = await fetch(this.tokenURL, {
      method: "POST",
      body: params,
      headers: {
        Authorization: this.basicAuthorization(
          config.spotifyClientID,
          config.spotifyClientSecret
        ),
      },
    });

    const jsonResponse = await response.json();

    if (code) {
      const token = jsonResponse as PersonalSpotifyToken;

      token.fetchedAt = new Date().getTime();
    }

    if (jsonResponse.error) {
      throw new SpotifyConnectionError(ctx.command.prefix);
    }

    this.tokenFetchedAt = new Date();

    return jsonResponse as SpotifyToken;
  }

  private async headers(ctx: SpotifyServiceContext) {
    const token = ctx.spotifyToken?.access_token || (await this.token(ctx));

    return {
      Authorization: this.bearerAuthorization(token),
    };
  }

  async request<T>(
    ctx: SpotifyServiceContext,
    options: SpotifyRequestOptions & { expectNoContent: true }
  ): Promise<undefined>;
  async request<T>(
    ctx: SpotifyServiceContext,
    options: SpotifyRequestOptions
  ): Promise<T>;
  async request<T>(
    ctx: SpotifyServiceContext,
    options: SpotifyRequestOptions
  ): Promise<T | undefined> {
    options = Object.assign({ method: "GET", params: {} }, options);

    this.log(
      ctx,
      `made API request to ${options.method} ${
        options.path
      } with params ${Logger.formatObject(options.params)}`
    );

    const headers = await this.headers(ctx);

    let response: Response;

    if (options.useBody) {
      response = await fetch(this.apiURL + options.path, {
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(options.params),
        method: options.method,
      });
    } else {
      response = await fetch(
        this.apiURL + options.path + "?" + stringify(options.params),
        {
          headers,
          method: options.method,
        }
      );
    }

    if (`${response.status}`.startsWith("4")) {
      console.log(await response.json());

      throw new SpotifyConnectionError(ctx.command.prefix);
    }

    return response.status !== 204 && !options.expectNoContent
      ? ((await response.json()) as T)
      : undefined;
  }

  // Search
  async search<T extends RawBaseSpotifyEntity<any>>(
    ctx: BaseServiceContext,
    querystring: string,
    entityType: [SpotifyEntityName] | [] = []
  ): Promise<RawSearchResponse<T>> {
    return await this.request(ctx, {
      path: "search",
      params: {
        q: querystring,
        type: entityType.join(","),
      },
    });
  }

  async searchArtist(
    ctx: BaseServiceContext,
    artist: string
  ): Promise<SpotifyArtistSearch> {
    const search = await this.search<RawSpotifyArtist>(ctx, artist, ["artist"]);

    return new SpotifyArtistSearch(search.artists, artist);
  }

  async searchAlbum(
    ctx: BaseServiceContext,
    params: SpotifySearchParams<{ artist: string; album: string }>
  ): Promise<SpotifyAlbumSearch> {
    const keywords = isKeywords(params)
      ? params.keywords
      : `${params.artist} ${params.album}`;

    const search = await this.search<RawSpotifyAlbum>(ctx, keywords, ["album"]);

    return new SpotifyAlbumSearch(search.albums, params);
  }

  async searchTrack(
    ctx: BaseServiceContext,
    params: SpotifySearchParams<{ artist: string; track: string }>
  ): Promise<SpotifyTrackSearch> {
    const keywords = isKeywords(params)
      ? params.keywords
      : `${params.artist} ${params.track}`;

    const search = await this.search<RawSpotifyTrack>(ctx, keywords, ["track"]);

    return new SpotifyTrackSearch(search.tracks, params);
  }

  // Tracks
  async getTrack(
    ctx: SpotifyServiceContext,
    id: SpotifyID
  ): Promise<SpotifyTrack> {
    const raw = await this.request<RawSpotifyTrack>(ctx, {
      path: `tracks/${id}`,
    });

    return new SpotifyTrack(raw);
  }

  // Player
  async queue(
    ctx: SpotifyServiceContext,
    uri: RawSpotifyURI<"track">
  ): Promise<void> {
    this.ensureAuthenticated(ctx);

    await this.request(ctx, {
      path: "me/player/queue",
      params: { uri },
      method: "POST",
      expectNoContent: true,
    });
  }

  async next(ctx: SpotifyServiceContext): Promise<void> {
    this.ensureAuthenticated(ctx);

    await this.request(ctx, {
      path: "me/player/next",
      method: "POST",
      expectNoContent: true,
    });
  }

  // Playlists
  async getPlaylists(
    ctx: SpotifyServiceContext
  ): Promise<SpotifyItemCollection<"playlist", SpotifyPlaylist>> {
    this.ensureAuthenticated(ctx);

    const response = await this.request<
      RawSpotifyItemCollection<RawSpotifyPlaylist>
    >(ctx, {
      path: "me/playlists",
      params: { limit: 50 },
    });

    return new SpotifyItemCollection<"playlist", SpotifyPlaylist>(
      response,
      SpotifyPlaylist
    );
  }

  async addToPlaylist(
    ctx: SpotifyServiceContext,
    playlistID: string,
    uris: RawSpotifyURI<"track">[]
  ): Promise<SpotifySnapshot> {
    this.ensureAuthenticated(ctx);

    return await this.request(ctx, {
      path: `playlists/${playlistID}/tracks`,
      method: "POST",
      params: { uris },
      useBody: true,
    });
  }

  // Librarys
  async saveTrackToLibrary(
    ctx: SpotifyServiceContext,
    id: SpotifyID
  ): Promise<void> {
    this.ensureAuthenticated(ctx);

    await this.request(ctx, {
      path: "me/tracks",
      method: "PUT",
      params: { ids: [id] },
      expectNoContent: true,
    });
  }

  async removeTrackFromLibrary(
    ctx: SpotifyServiceContext,
    id: SpotifyID
  ): Promise<void> {
    this.ensureAuthenticated(ctx);

    await this.request(ctx, {
      path: "me/tracks",
      method: "DELETE",
      params: { ids: [id] },
      expectNoContent: true,
    });
  }

  getKeywords(params: SpotifySearchParams<any>): string {
    if (isKeywords(params)) return params.keywords;
    else if (params.artist)
      return `${params.artist} ${params.album || params.track || ""}`.trim();
    else return "";
  }

  private ensureAuthenticated(ctx: SpotifyServiceContext) {
    if (!ctx.spotifyToken) {
      throw new NotAuthenticatedWithSpotifyError(ctx.command.prefix);
    }
  }
}
