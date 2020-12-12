import fetch from "node-fetch";
import { BaseService } from "../BaseService";
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

export class SpotifyService extends BaseService {
  url = "https://api.spotify.com/v1/";
  tokenURL = "https://accounts.spotify.com/api/token";

  private _token?: SpotifyToken;

  private tokenIsValid(token: SpotifyToken): boolean {
    let dateExpires = add(new Date(), { seconds: token.expires_in });
    return isBefore(new Date(), dateExpires);
  }

  private async token(): Promise<string> {
    if (this._token && this.tokenIsValid(this._token))
      return this._token.access_token;
    else {
      let token = await this.fetchToken();
      this._token = token;
      return token.access_token;
    }
  }

  private async fetchToken(): Promise<SpotifyToken> {
    this.log("fetching new token");
    let params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    let response = await fetch(this.tokenURL, {
      method: "POST",
      body: params,
      headers: {
        Authorization: this.basicAuthorization(
          config.spotifyClientID,
          config.spotifyClientSecret
        ),
      },
    });

    return (await response.json()) as SpotifyToken;
  }

  private async headers() {
    return {
      Authorization: this.bearerAuthorization(await this.token()),
    };
  }

  async request<T>(path: string, params: { [key: string]: any }): Promise<T> {
    this.log(`made API request to ${path} with params ${params}`);
    let response = await fetch(this.url + path + "?" + stringify(params), {
      headers: await this.headers(),
    });

    return (await response.json()) as T;
  }

  async search(
    querystring: string,
    entityType: SpotifyEntity[] = []
  ): Promise<SearchResponse> {
    return await this.request("search", {
      q: querystring,
      type: entityType.join(","),
    });
  }

  async searchArtist(artist: string): Promise<SearchItem | undefined> {
    let search = await this.search(artist, ["artist"]);

    return (
      search.artists.items.find((a) => this.compare(a.name, artist)) ||
      search.artists.items[0]
    );
  }

  async searchAlbum(
    artist: string,
    album: string
  ): Promise<SearchItem | undefined> {
    let search = await this.search(artist + " " + album, ["album"]);

    return search.albums.items[0];
  }

  async searchTrack(
    artist: string,
    track: string
  ): Promise<SearchItem | undefined> {
    return await this.searchTrackRaw(artist + " " + track);
  }

  async searchTrackRaw(keywords: string): Promise<SearchItem | undefined> {
    let search = await this.search(keywords, ["track"]);

    return search.tracks.items[0];
  }

  async searchAlbumRaw(keywords: string): Promise<SearchItem | undefined> {
    let search = await this.search(keywords, ["album"]);

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
