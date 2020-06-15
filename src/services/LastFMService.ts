import { stringify } from "querystring";
import fetch from "node-fetch";

import {
  RecentTracksResponse,
  TrackInfoResponse,
  ArtistInfoResponse,
  AlbumInfoResponse,
  UserInfoResponse,
  TopArtistsResponse,
  TopAlbumsResponse,
  TopTracksResponse,
} from "./LastFMService.types";

import config from "../../config.json";
import { ParsedTrack, parseLastFMTrackResponse } from "../helpers/lastFM";
import { LastFMConnectionError, LastFMError } from "../errors";

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

    if (!response.ok) throw new LastFMConnectionError();

    let jsonResponse = await response.json();

    if (jsonResponse.error) throw new LastFMError(jsonResponse);

    return jsonResponse as T;
  }

  async recentTracks(
    username: string,
    limit?: number
  ): Promise<RecentTracksResponse> {
    let params: Params = {
      username,
    };

    if (limit) params.limit = limit;

    return await this.request<RecentTracksResponse>("user.getrecenttracks", {
      username,
      limit: 1,
    });
  }

  async nowPlaying(username: string): Promise<RecentTracksResponse> {
    return await this.recentTracks(username, 1);
  }

  async nowPlayingParsed(username: string): Promise<ParsedTrack> {
    let nowPlaying = await this.nowPlaying(username);
    return parseLastFMTrackResponse(nowPlaying.recenttracks.track[0]);
  }

  async trackInfo(
    artist: string,
    track: string,
    username?: string
  ): Promise<TrackInfoResponse> {
    let params: Params = { track: track.trim(), artist: artist.trim() };
    if (username) {
      params.username = username;
    }
    return await this.request<TrackInfoResponse>("track.getInfo", params);
  }

  async artistInfo(
    artist: string,
    username?: string
  ): Promise<ArtistInfoResponse> {
    let params: Params = { artist: artist.trim() };
    if (username) {
      params.username = username;
    }
    return await this.request<ArtistInfoResponse>("artist.getInfo", params);
  }

  async albumInfo(
    artist: string,
    album: string,
    username?: string
  ): Promise<AlbumInfoResponse> {
    let params: Params = { artist: artist.trim(), album: album.trim() };
    if (username) {
      params.username = username;
    }
    return await this.request<AlbumInfoResponse>("album.getInfo", params);
  }

  async userInfo(username: string): Promise<UserInfoResponse> {
    return await this.request<UserInfoResponse>("user.getInfo", { username });
  }

  async topArtists(
    username: string,
    limit = 50,
    page = 1
  ): Promise<TopArtistsResponse> {
    return await this.request<TopArtistsResponse>("user.getTopArtists", {
      username,
      limit,
      page,
    });
  }

  async topAlbums(username: string, limit = 50, page = 1): Promise<TopAlbumsResponse> {
    return await this.request<TopAlbumsResponse>("user.getTopAlbums", { username, limit, page });
  }

  async topTracks(username: string, limit = 50, page = 1): Promise<TopTracksResponse> {
    return await this.request<TopTracksResponse>("user.getTopTracks", { username, limit, page });
  }
}
