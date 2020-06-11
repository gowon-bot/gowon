import { stringify } from "querystring";
import fetch from "node-fetch";

import { GetRecentTracksResponse } from "./LastFMService.types";

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

  async nowPlaying(username: string): Promise<GetRecentTracksResponse> {
    let params = this.buildParams({
      username,
      limit: 1,
      method: "user.getrecenttracks",
    });

    let response = await fetch(this.url + "?" + params);

    return await response.json();
  }
}
