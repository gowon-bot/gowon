import fetch from "node-fetch";
import { BaseService, BaseServiceContext } from "../BaseService";
import config from "../../../config.json";
import { URLSearchParams } from "url";
import { add, isBefore } from "date-fns";
import { stringify } from "querystring";
import {
  SearchItem,
  SearchResponse,
  SpotifyEntity,
  SpotifyToken,
} from "./SpotifyService.types";
import { SimpleMap } from "../../helpers/types";
import { SpotifyConnectionError } from "../../errors";
import { Logger } from "../../lib/Logger";

export class SpotifyService extends BaseService {
  url = "https://api.spotify.com/v1/";
  tokenURL = "https://accounts.spotify.com/api/token";

  private _token?: SpotifyToken;

  private tokenIsValid(token: SpotifyToken): boolean {
    const dateExpires = add(new Date(), { seconds: token.expires_in });
    return isBefore(new Date(), dateExpires);
  }

  private async token(ctx: BaseServiceContext): Promise<string> {
    if (this._token && this.tokenIsValid(this._token)) {
      return this._token.access_token;
    } else {
      const token = await this.fetchToken(ctx);
      this._token = token;
      return token.access_token;
    }
  }

  private async fetchToken(ctx: BaseServiceContext): Promise<SpotifyToken> {
    this.log(ctx, "fetching new token");
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

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

    console.log(jsonResponse);

    return jsonResponse as SpotifyToken;
  }

  private async headers(ctx: BaseServiceContext) {
    return {
      Authorization: this.bearerAuthorization(await this.token(ctx)),
    };
  }

  async request<T>(
    ctx: BaseServiceContext,
    path: string,
    params: SimpleMap
  ): Promise<T> {
    this.log(
      ctx,
      `made API request to ${path} with params ${Logger.formatObject(params)}`
    );

    const response = await fetch(this.url + path + "?" + stringify(params), {
      headers: await this.headers(ctx),
    });

    if (`${response.status}`.startsWith("4")) {
      console.error(response);
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
    let search = await this.search(ctx, artist, ["artist"]);

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
    let search = await this.search(ctx, artist + " " + album, ["album"]);

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
    let search = await this.search(ctx, keywords, ["track"]);

    return search.tracks.items[0];
  }

  async searchAlbumRaw(
    ctx: BaseServiceContext,
    keywords: string
  ): Promise<SearchItem | undefined> {
    let search = await this.search(ctx, keywords, ["album"]);

    return search.albums.items[0];
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
}
