import { stringify } from "querystring";
import fetch from "node-fetch";

import {
  GetRecentTracksResponse,
  GetTrackInfoResponse,
  GetArtistInfoResponse,
} from "./LastFMService.types";

import config from "../../config.json";

interface Params {
  [key: string]: any;
}

export class LastFMService {
  url = "http://ws.audioscrobbler.com/2.0/";

  get apikey(): string {
    return config.lastFMAPIKey;
  }

  private buildParams(params: Params): string {
    return stringify({
      format: "json",
      api_key: this.apikey,
      ...params,
    });
  }

  private async request<T>(method: string, params: Params): Promise<T> {
    let qparams = this.buildParams({ method, ...params });

    let response = await fetch(this.url + "?" + qparams);

    return await response.json();
  }

  async nowPlaying(username: string): Promise<GetRecentTracksResponse> {
    return await this.request<GetRecentTracksResponse>("user.getrecenttracks", {
      username,
      limit: 1,
    });
  }

  async trackInfo(
    artist: string,
    track: string,
    username?: string
  ): Promise<GetTrackInfoResponse> {
    let params: Params = { track, artist };
    if (username) {
      params.username = username;
    }
    return await this.request<GetTrackInfoResponse>("track.getInfo", params);
  }

  async artistInfo(artist: string, username?: string): Promise<GetArtistInfoResponse> {
    let params: Params = { artist };
    if (username) {
      params.username = username;
    }
    return await this.request<GetArtistInfoResponse>("artist.getInfo", params);
  }
}
