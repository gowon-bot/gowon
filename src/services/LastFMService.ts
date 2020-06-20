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
  RecentTracks,
  Track,
  ArtistInfo,
  AlbumInfo,
  UserInfo,
  TopArtists,
  TopAlbums,
  TopTracks,
  TrackInfo,
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

    if (`${response.status}`.startsWith("3"))
      throw new LastFMConnectionError(response);

    let jsonResponse = await response.json();

    if (jsonResponse.error) throw new LastFMError(jsonResponse);

    return jsonResponse as T;
  }

  async recentTracks(username: string, limit?: number): Promise<RecentTracks> {
    let params: Params = {
      username,
    };

    if (limit) params.limit = limit;

    return (
      await this.request<RecentTracksResponse>("user.getrecenttracks", {
        username,
        limit: 1,
      })
    ).recenttracks;
  }

  async nowPlaying(username: string): Promise<Track> {
    return (await this.recentTracks(username, 1)).track[0];
  }

  async nowPlayingParsed(username: string): Promise<ParsedTrack> {
    let nowPlaying = await this.nowPlaying(username);
    return parseLastFMTrackResponse(nowPlaying);
  }

  async getNumberScrobbles(
    username: string,
    from?: Date,
    to?: Date
  ): Promise<number> {
    let params: Params = { user: username, limit: 1 };

    if (from) params.from = ~~(from.getTime() / 1000);
    if (to) params.to = ~~(to.getTime() / 1000);

    let recentTracks = await this.request<RecentTracksResponse>(
      "user.getRecentTracks",
      params
    );

    return parseInt(recentTracks.recenttracks["@attr"].total, 10) || 0;
  }

  async trackInfo(
    artist: string,
    track: string,
    username?: string
  ): Promise<TrackInfo> {
    let params: Params = { track: track.trim(), artist: artist.trim() };
    if (username) {
      params.username = username;
    }
    return (await this.request<TrackInfoResponse>("track.getInfo", params))
      .track;
  }

  async artistInfo(artist: string, username?: string): Promise<ArtistInfo> {
    let params: Params = { artist: artist.trim() };
    if (username) {
      params.username = username;
    }
    return (await this.request<ArtistInfoResponse>("artist.getInfo", params))
      .artist;
  }

  async albumInfo(
    artist: string,
    album: string,
    username?: string
  ): Promise<AlbumInfo> {
    let params: Params = { artist: artist.trim(), album: album.trim() };
    if (username) {
      params.username = username;
    }
    return (await this.request<AlbumInfoResponse>("album.getInfo", params))
      .album;
  }

  async userInfo(username: string): Promise<UserInfo> {
    return (await this.request<UserInfoResponse>("user.getInfo", { username }))
      .user;
  }

  async userExists(username: string): Promise<boolean> {
    try {
      let user = await this.userInfo(username);

      return !!user.name;
    } catch (e) {
      if (e.name === "LastFMConnectionError") {
        if (e.response?.status === 404) {
          return false;
        }
      }
      throw e;
    }
  }

  async topArtists(
    username: string,
    limit = 50,
    page = 1
  ): Promise<TopArtists> {
    return (
      await this.request<TopArtistsResponse>("user.getTopArtists", {
        username,
        limit,
        page,
      })
    ).topartists;
  }

  async artistCount(username: string, timePeriod = "overall"): Promise<number> {
    let topArtists = await this.request<TopArtistsResponse>(
      "user.getTopArtists",
      {
        username,
        limit: 1,
        period: timePeriod,
      }
    );

    return parseInt(topArtists.topartists["@attr"].total, 10) || 0;
  }

  async topAlbums(username: string, limit = 50, page = 1): Promise<TopAlbums> {
    return (
      await this.request<TopAlbumsResponse>("user.getTopAlbums", {
        username,
        limit,
        page,
      })
    ).topalbums;
  }

  async albumCount(username: string, timePeriod = "overall"): Promise<number> {
    let topArtists = await this.request<TopAlbumsResponse>(
      "user.getTopAlbums",
      {
        username,
        limit: 1,
        period: timePeriod,
      }
    );

    return parseInt(topArtists.topalbums["@attr"].total, 10) || 0;
  }

  async topTracks(username: string, limit = 50, page = 1): Promise<TopTracks> {
    return (
      await this.request<TopTracksResponse>("user.getTopTracks", {
        username,
        limit,
        page,
      })
    ).toptracks;
  }

  async trackCount(username: string, timePeriod = "overall"): Promise<number> {
    let topArtists = await this.request<TopTracksResponse>(
      "user.getTopTracks",
      {
        username,
        limit: 1,
        period: timePeriod,
      }
    );

    return parseInt(topArtists.toptracks["@attr"].total, 10) || 0;
  }
}
