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
  TagInfo,
  TagInfoResponse,
  ArtistTopTracks,
  ArtistTopTracksResponse,
  Params,
  RecentTracksParams,
  TrackInfoParams,
  ArtistInfoParams,
  AlbumInfoParams,
  UserInfoParams,
  TagInfoParams,
  TopArtistsParams,
  LastFMPeriod,
  TopAlbumsParams,
  TopTracksParams,
  ArtistTopTracksParams,
  TagTopArtistsParams,
  TagTopArtists,
  TagTopArtistsResponse,
} from "./LastFMService.types";

import config from "../../config.json";
import { ParsedTrack, parseLastFMTrackResponse } from "../helpers/lastFM";
import {
  LastFMConnectionError,
  LastFMError,
  LogicError,
  BadLastFMResponseError,
} from "../errors";
import { BaseService } from "./BaseService";
import moment from "moment";
import { numberDisplay } from "../helpers";
import { LastFMScraper } from "./scrapingServices/LastFMScraper";

export class LastFMService extends BaseService {
  url = "http://ws.audioscrobbler.com/2.0/";
  scraper = new LastFMScraper(this);

  get apikey(): string {
    return config.lastFMAPIKey;
  }

  buildParams(params: Params): string {
    return stringify({
      format: "json",
      api_key: this.apikey,
      ...params,
    });
  }

  async request<T>(method: string, params: Params): Promise<T> {
    this.log(
      `made API request for ${method} with params ${JSON.stringify(params)}`
    );

    let qparams = this.buildParams({ method, ...params });

    let response = await fetch(this.url + "?" + qparams);

    if (`${response.status}`.startsWith("3"))
      throw new LastFMConnectionError(response);

    let jsonResponse = await response.json();

    if (jsonResponse.error) throw new LastFMError(jsonResponse);
    
    return jsonResponse as T;
  }

  async recentTracks(params: RecentTracksParams): Promise<RecentTracks> {
    return (
      await this.request<RecentTracksResponse>("user.getrecenttracks", params)
    ).recenttracks;
  }

  async nowPlaying(username: string): Promise<Track> {
    return (await this.recentTracks({ username, limit: 1 })).track[0];
  }

  async nowPlayingParsed(username: string): Promise<ParsedTrack> {
    let nowPlaying = await this.nowPlaying(username);
    return parseLastFMTrackResponse(nowPlaying);
  }

  async getMilestone(username: string, milestone: number): Promise<Track> {
    let total = (await this.recentTracks({ username, limit: 1 }))["@attr"]
      .total;

    let response = await this.recentTracks({
      username,
      page: total.toInt() - milestone + 1,
      limit: 1,
    });

    if (milestone > response["@attr"].total.toInt()) {
      throw new LogicError(
        `${username.code()} hasn't scrobbled ${numberDisplay(
          milestone,
          "track"
        )} yet!`
      );
    }

    return response.track[1] ?? response.track[0];
  }

  async getNumberScrobbles(
    username: string,
    from?: Date,
    to?: Date
  ): Promise<number> {
    let params: RecentTracksParams = { username, limit: 1 };

    if (from) params.from = ~~(from.getTime() / 1000);
    if (to) params.to = ~~(to.getTime() / 1000);

    let recentTracks = await this.recentTracks(params);

    return recentTracks["@attr"].total.toInt() || 0;
  }

  async trackInfo(params: TrackInfoParams): Promise<TrackInfo> {
    let response = (
      await this.request<TrackInfoResponse>("track.getInfo", params)
    ).track;

    if (
      response?.userplaycount !== undefined &&
      isNaN(response.userplaycount.toInt())
    )
      throw new BadLastFMResponseError();

    return response;
  }

  async artistInfo(params: ArtistInfoParams): Promise<ArtistInfo> {
    let response = (
      await this.request<ArtistInfoResponse>("artist.getInfo", params)
    ).artist;

    if (
      response?.stats?.userplaycount !== undefined &&
      isNaN(response.stats.userplaycount.toInt())
    )
      throw new BadLastFMResponseError();

    return response;
  }

  async albumInfo(params: AlbumInfoParams): Promise<AlbumInfo> {
    let response = (
      await this.request<AlbumInfoResponse>("album.getInfo", params)
    ).album;

    if (
      response?.userplaycount !== undefined &&
      isNaN(response.userplaycount.toInt())
    )
      throw new BadLastFMResponseError();

    return response;
  }

  async userInfo(params: UserInfoParams): Promise<UserInfo> {
    return (await this.request<UserInfoResponse>("user.getInfo", params)).user;
  }

  async userExists(username: string): Promise<boolean> {
    try {
      let user = await this.userInfo({ username });

      return !!user.name;
    } catch (e) {
      if (e.name === "LastFMConnectionError" || e.name === "LastFMError:8") {
        return false;
      }
      throw e;
    }
  }

  async tagInfo(params: TagInfoParams): Promise<TagInfo> {
    return (await this.request<TagInfoResponse>("tag.getInfo", params)).tag;
  }

  async topArtists(params: TopArtistsParams): Promise<TopArtists> {
    return (
      await this.request<TopArtistsResponse>("user.getTopArtists", {
        limit: 50,
        page: 1,
        period: "overall",
        ...params,
      })
    ).topartists;
  }

  async artistCount(
    username: string,
    timePeriod: LastFMPeriod = "overall"
  ): Promise<number> {
    let topArtists = await this.topArtists({
      username,
      limit: 1,
      period: timePeriod,
    });

    return topArtists["@attr"].total.toInt() || 0;
  }

  async topAlbums(params: TopAlbumsParams): Promise<TopAlbums> {
    return (
      await this.request<TopAlbumsResponse>("user.getTopAlbums", {
        limit: 50,
        page: 1,
        period: "overall",
        ...params,
      })
    ).topalbums;
  }

  async albumCount(
    username: string,
    timePeriod: LastFMPeriod = "overall"
  ): Promise<number> {
    let topArtists = await this.topAlbums({
      username,
      limit: 1,
      period: timePeriod,
    });

    return topArtists["@attr"].total.toInt() || 0;
  }

  async topTracks(params: TopTracksParams): Promise<TopTracks> {
    return (
      await this.request<TopTracksResponse>("user.getTopTracks", {
        page: 1,
        limit: 50,
        period: "overall",
        ...params,
      })
    ).toptracks;
  }

  async trackCount(
    username: string,
    timePeriod: LastFMPeriod = "overall"
  ): Promise<number> {
    let topTracks = await this.topTracks({
      username,
      limit: 1,
      period: timePeriod,
    });

    return topTracks["@attr"].total.toInt() || 0;
  }

  async goBack(username: string, when: Date): Promise<Track> {
    let to = moment(when).add(1, "day").toDate();

    let params = {
      username,
      limit: 1,
      from: ~~(when.getTime() / 1000),
      to: ~~(to.getTime() / 1000),
    };

    let recentTracks = await this.recentTracks(params);

    return recentTracks.track[1] ?? recentTracks.track[0];
  }

  async artistTopTracks(
    params: ArtistTopTracksParams
  ): Promise<ArtistTopTracks> {
    let response = await this.request<ArtistTopTracksResponse>(
      "artist.getTopTracks",
      params
    );

    return response.toptracks;
  }

  async getArtistPlays(username: string, artist: string): Promise<number> {
    let playcount = (
      await this.artistInfo({ artist, username })
    ).stats?.userplaycount?.toInt();

    if (isNaN(playcount)) throw new BadLastFMResponseError();

    return playcount;
  }

  async correctArtist(params: ArtistInfoParams): Promise<string> {
    return (await this.artistInfo(params)).name;
  }

  async correctAlbum(
    params: AlbumInfoParams
  ): Promise<{ artist: string; album: string }> {
    let response = await this.albumInfo(params);

    return {
      artist: response.artist,
      album: response.name,
    };
  }

  async correctTrack(
    params: TrackInfoParams
  ): Promise<{ artist: string; track: string }> {
    let response = await this.trackInfo(params);

    return {
      artist: response.artist.name,
      track: response.name,
    };
  }

  async tagTopArtists(params: TagTopArtistsParams): Promise<TagTopArtists> {
    let response = await this.request<TagTopArtistsResponse>(
      "tag.gettopartists",
      params
    );
    return response.topartists;
  }
}
