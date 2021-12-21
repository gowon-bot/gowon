import fetch, { Response } from "node-fetch";
import config from "../../../config.json";
import { URLSearchParams } from "url";
import { stringify } from "querystring";
import {
  PersonalSpotifyToken,
  SearchItem,
  SearchResponse,
  SpotifyCode,
  SpotifyEntityName,
  SpotifyTrack,
  SpotifyToken,
  SpotifyTrackURI,
  SpotifyURI,
} from "./SpotifyService.types";
import { SimpleMap } from "../../helpers/types";
import {
  NotAuthenticatedWithSpotifyError,
  SpotifyConnectionError,
} from "../../errors";
import { Logger } from "../../lib/Logger";
import { GowonContext } from "../../lib/context/Context";
import { BaseSpotifyService } from "./BaseSpotifyService";

export type SpotifyServiceContext = GowonContext<{
  mutable: { spotifyToken?: PersonalSpotifyToken };
}>;

interface SpotifyRequestOptions {
  path: string;
  params?: SimpleMap;
  method?: "POST" | "GET";
  useBody?: boolean;
  expectNoContent?: boolean;
}

export class SpotifyService extends BaseSpotifyService {
  private _token?: SpotifyToken;
  private tokenFetchedAt = new Date();

  generateURI<T extends SpotifyEntityName>(
    entity: T,
    id: string
  ): SpotifyURI<T> {
    return `spotify:${entity}:${id}`;
  }

  getIDFromURI(uri: SpotifyURI<SpotifyEntityName>): string {
    return uri.split(":")[2];
  }

  private async token(ctx: SpotifyServiceContext): Promise<string> {
    if (this._token && this.tokenIsValid(this._token, this.tokenFetchedAt)) {
      return this._token.access_token;
    } else {
      const token = await this.fetchToken(ctx);
      this._token = token;
      return token.access_token;
    }
  }

  async fetchToken(
    ctx: SpotifyServiceContext,
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
    const token =
      ctx.mutable.spotifyToken?.access_token || (await this.token(ctx));

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
      `made API request to ${options.path} with params ${Logger.formatObject(
        options.params
      )}`
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
      throw new SpotifyConnectionError(ctx.command.prefix);
    }

    return response.status !== 204 ? ((await response.json()) as T) : undefined;
  }

  // Search
  async search<T = SearchItem>(
    ctx: SpotifyServiceContext,
    querystring: string,
    entityType: SpotifyEntityName[] = []
  ): Promise<SearchResponse<T>> {
    return await this.request(ctx, {
      path: "search",
      params: {
        q: querystring,
        type: entityType.join(","),
      },
    });
  }

  async searchArtist(
    ctx: SpotifyServiceContext,
    artist: string
  ): Promise<SearchItem | undefined> {
    const search = await this.search(ctx, artist, ["artist"]);

    return this.getBestMatchingArtist(search.artists.items, artist);
  }

  async searchAlbum(
    ctx: SpotifyServiceContext,
    artist: string,
    album: string
  ): Promise<SearchItem | undefined> {
    const search = await this.search(ctx, artist + " " + album, ["album"]);

    return search.albums.items[0];
  }

  async searchTrack(
    ctx: SpotifyServiceContext,
    artist: string,
    track: string
  ): Promise<SpotifyTrack | undefined> {
    const search = await this.search<SpotifyTrack>(ctx, artist + " " + track, [
      "track",
    ]);

    return this.getBestMatchingTrack(search.tracks.items, artist, track);
  }

  async searchTrackRaw(
    ctx: SpotifyServiceContext,
    keywords: string
  ): Promise<SpotifyTrack | undefined> {
    const search = await this.search<SpotifyTrack>(ctx, keywords, ["track"]);

    return search.tracks.items[0];
  }

  async searchAlbumRaw(
    ctx: SpotifyServiceContext,
    keywords: string
  ): Promise<SearchItem | undefined> {
    const search = await this.search(ctx, keywords, ["album"]);

    return search.albums.items[0];
  }

  // Tracks
  async getTrack(ctx: SpotifyServiceContext, id: string) {
    return await this.request<SpotifyTrack>(ctx, {
      path: `tracks/${id}`,
    });
  }

  // Player
  async queue(ctx: SpotifyServiceContext, uri: SpotifyTrackURI): Promise<void> {
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

  getImageFromSearchItem(si: SearchItem): string {
    return (
      si.images.sort((a, b) => b.height * b.width - a.height * a.width)[0]
        ?.url || ""
    );
  }

  private compare(string1: string, string2: string) {
    return (
      this.cleanBadTags(string1).toLowerCase().trim() ===
      this.cleanBadTags(string2).toLowerCase().trim()
    );
  }

  private cleanBadTags(string: string): string {
    return (
      string
        // To do: replace this with a service that contains all the bad tags (that is easy to add to)
        .replaceAll(
          /(- Remastered .*| - Deluxe| - Single Version| - Album Version)/g,
          ""
        )
        .replaceAll(/'"`‘’:/g, "")
    );
  }

  private ensureAuthenticated(ctx: SpotifyServiceContext) {
    if (!ctx.mutable.spotifyToken) {
      throw new NotAuthenticatedWithSpotifyError(ctx.command.prefix);
    }
  }

  private getBestMatchingArtist(
    artists: SearchItem[],
    searchArtist: string
  ): SearchItem {
    return (
      artists.find((a) => this.compare(a.name, searchArtist)) || artists[0]
    );
  }

  private getBestMatchingTrack(
    tracks: SpotifyTrack[],
    searchArtist: string,
    searchTrack: string
  ): SpotifyTrack {
    return (
      tracks.find((t) => {
        if (
          this.compare(t.artists[0].name, searchArtist) &&
          this.compare(t.name, searchTrack)
        ) {
          t.isExactMatch = true;
          return true;
        }
        return false;
      }) || tracks[0]
    );
  }
}
