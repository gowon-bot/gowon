import { stringify } from "querystring";
import fetch, { RequestInit } from "node-fetch";
import crypto from "crypto";

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
  TopAlbumsParams,
  TopTracksParams,
  ArtistTopTracksParams,
  TagTopArtistsParams,
  TagTopArtists,
  TagTopArtistsResponse,
  TrackSearchParams,
  TrackSearchResponse,
  GetSessionParams,
  ScrobbleParams,
  GetArtistCorrectionParams,
  ArtistCorrection,
  GetArtistCorrectionResponse,
} from "./LastFMService.types";
import config from "../../../config.json";
import {
  LastFMConnectionError,
  LastFMError,
  BadLastFMResponseError,
  RecordNotFoundError,
} from "../../errors";
import { BaseService } from "../BaseService";
import { LastFMScraper } from "../scrapingServices/LastFMScraper";

export class LastFMAPIService extends BaseService {
  url = "https://ws.audioscrobbler.com/2.0/";
  scraper = new LastFMScraper(this.logger);

  get apikey(): string {
    return config.lastFMAPIKey;
  }

  get defaultParams(): Params {
    return {
      format: "json",
      api_key: this.apikey,
    };
  }

  buildParams(params: Params): string {
    return stringify({
      ...this.defaultParams,
      ...params,
    });
  }

  async request<T>(
    method: string,
    params: Params,
    fetchOptions?: RequestInit
  ): Promise<T> {
    this.log(
      `made API request for ${method} with params ${JSON.stringify(params)}`
    );

    let qparams = (params as any).api_key
      ? stringify({ ...params })
      : this.buildParams({ method, ...params });

    let response = await fetch(this.url + "?" + qparams, fetchOptions);

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
      params.username &&
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

  async artistTopTracks(
    params: ArtistTopTracksParams
  ): Promise<ArtistTopTracks> {
    let response = await this.request<ArtistTopTracksResponse>(
      "artist.getTopTracks",
      params
    );

    return response.toptracks;
  }

  async tagTopArtists(params: TagTopArtistsParams): Promise<TagTopArtists> {
    let response = await this.request<TagTopArtistsResponse>(
      "tag.gettopartists",
      params
    );
    return response.topartists;
  }

  async trackSearch(params: TrackSearchParams): Promise<TrackSearchResponse> {
    let response = await this.request<TrackSearchResponse>(
      "track.search",
      params
    );

    return response;
  }

  async getArtistCorrection(
    params: GetArtistCorrectionParams
  ): Promise<ArtistCorrection> {
    let response = await this.request<GetArtistCorrectionResponse>(
      "artist.getCorrection",
      params
    );

    if (!response.corrections) throw new RecordNotFoundError("artist");

    return response.corrections.correction.artist;
  }

  private async authRequest<T>(
    method: string,
    params: Params,
    options: { post?: boolean } = { post: false }
  ): Promise<T> {
    let builtParams = { ...this.defaultParams, ...params, method };
    let signature = Object.keys(builtParams)
      .filter((k) => k !== "format")
      .sort()
      .map((k) => `${k}${(builtParams as any)[k]}`)
      .join("");

    let api_sig = crypto
      .createHash("md5")
      .update(`${signature}${config.lastFMSecret}`, "utf8")
      .digest("hex");

    return await this.request<T>(
      method,
      { ...builtParams, api_sig },
      {
        method: options.post ? "POST" : "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
  }

  async getToken(): Promise<{ token: string }> {
    return await this.authRequest("auth.getToken", {});
  }

  async getSession(params: GetSessionParams) {
    return await this.authRequest("auth.getSession", params);
  }

  async scrobbleTrack(params: ScrobbleParams, sk?: string) {
    return await this.authRequest(
      "track.scrobble",
      {
        ...params,
        sk: sk || config.lastFMVerificationSessionKey,
      },
      { post: true }
    );
  }
}
