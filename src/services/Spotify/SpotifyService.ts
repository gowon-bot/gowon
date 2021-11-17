import fetch, { Response } from "node-fetch";
import { BaseServiceContext } from "../BaseService";
import config from "../../../config.json";
import { URLSearchParams } from "url";
import { stringify } from "querystring";
import {
  PersonalSpotifyToken,
  SearchItem,
  SearchResponse,
  SpotifyCode,
  SpotifyEntity,
  SpotifyToken,
} from "./SpotifyService.types";
import { SimpleMap } from "../../helpers/types";
import {
  NotAuthenticatedWithSpotifyError,
  SpotifyConnectionError,
} from "../../errors";
import { Logger } from "../../lib/Logger";
import { BaseSpotifyService } from "./BaseSpotifyService";

export type SpotifyServiceContext = BaseServiceContext & {
  spotifyToken?: PersonalSpotifyToken;
};

export class SpotifyService extends BaseSpotifyService {
  private _token?: SpotifyToken;
  private tokenFetchedAt = new Date();

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
    path: string,
    params: SimpleMap,
    post = false
  ): Promise<T> {
    this.log(
      ctx,
      `made API request to ${path} with params ${Logger.formatObject(params)}`
    );

    const headers = await this.headers(ctx);

    let response: Response;

    if (post) {
      response = await fetch(this.apiURL + path, {
        headers,
        method: "POST",
        body: JSON.stringify(params),
      });
    } else {
      response = await fetch(this.apiURL + path + "?" + stringify(params), {
        headers,
      });
    }

    console.log(await response.json());

    if (`${response.status}`.startsWith("4")) {
      throw new SpotifyConnectionError(ctx.command.prefix);
    }

    return (await response.json()) as T;
  }

  async search(
    ctx: BaseServiceContext,
    querystring: string,
    entityType: SpotifyEntity[] = []
  ): Promise<SearchResponse> {
    return await this.request(ctx, "search", {
      q: querystring,
      type: entityType.join(","),
    });
  }

  async searchArtist(
    ctx: BaseServiceContext,
    artist: string
  ): Promise<SearchItem | undefined> {
    const search = await this.search(ctx, artist, ["artist"]);

    return (
      search.artists.items.find((a) => this.compare(a.name, artist)) ||
      search.artists.items[0]
    );
  }

  async searchAlbum(
    ctx: BaseServiceContext,
    artist: string,
    album: string
  ): Promise<SearchItem | undefined> {
    const search = await this.search(ctx, artist + " " + album, ["album"]);

    return search.albums.items[0];
  }

  async searchTrack(
    ctx: BaseServiceContext,
    artist: string,
    track: string
  ): Promise<SearchItem | undefined> {
    return await this.searchTrackRaw(ctx, artist + " " + track);
  }

  async searchTrackRaw(
    ctx: BaseServiceContext,
    keywords: string
  ): Promise<SearchItem | undefined> {
    const search = await this.search(ctx, keywords, ["track"]);

    return search.tracks.items[0];
  }

  async searchAlbumRaw(
    ctx: BaseServiceContext,
    keywords: string
  ): Promise<SearchItem | undefined> {
    const search = await this.search(ctx, keywords, ["album"]);

    return search.albums.items[0];
  }

  async createPlaylist(ctx: SpotifyServiceContext, name: string) {
    this.ensureAuthenticated(ctx);

    const response = await this.request(
      ctx,
      `users/xlm1c9jushfd8b87dl9mxxqs2/playlists`,
      {
        name,
        description: "hello from gowon",
        public: true,
      },
      true
    );

    console.log(response);
  }

  getImageFromSearchItem(si: SearchItem): string {
    return (
      si.images.sort((a, b) => b.height * b.width - a.height * a.width)[0]
        ?.url || ""
    );
  }

  private compare(string1: string, string2: string) {
    return (
      string1.toLowerCase().replace(/'"`‘’:/, "") ===
      string2.toLowerCase().replace(/'"`‘’:/, "")
    );
  }

  private ensureAuthenticated(ctx: SpotifyServiceContext) {
    if (!ctx.spotifyToken) {
      throw new NotAuthenticatedWithSpotifyError(ctx.command.prefix);
    }
  }
}
