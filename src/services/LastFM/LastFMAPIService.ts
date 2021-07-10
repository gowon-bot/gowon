import { stringify } from "querystring";
import fetch, { RequestInit } from "node-fetch";
import crypto from "crypto";
import {
  RawRecentTracksResponse,
  RawTrackInfoResponse,
  RawArtistInfoResponse,
  RawAlbumInfoResponse,
  RawUserInfoResponse,
  RawTopArtistsResponse,
  RawTopAlbumsResponse,
  RawTopTracksResponse,
  RawRecentTracks,
  RawArtistInfo,
  RawAlbumInfo,
  RawUserInfo,
  RawTopArtists,
  RawTopAlbums,
  RawTopTracks,
  RawTrackInfo,
  RawTagInfo,
  RawTagInfoResponse,
  RawArtistPopularTracks,
  RawArtistPopularTracksResponse,
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
  ArtistPopularTracksParams,
  TagTopArtistsParams,
  RawTagTopArtists,
  RawTagTopArtistsResponse,
  TrackSearchParams,
  RawTrackSearchResponse,
  GetSessionParams,
  ScrobbleParams,
  GetArtistCorrectionParams,
  RawArtistCorrection,
  RawGetArtistCorrectionResponse,
  RawRecentTracksExtended,
  UserGetFriendsParams,
  RawFriends,
  RawUserGetFriendsResponse,
  TagTopTracksParams,
  RawTagTopTracks,
  RawTagTopTracksResponse,
  RawLastFMSession,
  TrackLoveParams,
} from "./LastFMService.types";
import config from "../../../config.json";
import {
  LastFMConnectionError,
  LastFMError,
  BadLastFMResponseError,
  RecordNotFoundError,
} from "../../errors";
import { BaseService } from "../BaseService";
import { toInt } from "../../helpers/lastFM";
import { MirrorballCacheService } from "../mirrorball/MirrorballCacheService";

export interface SessionKey {
  username: string;
  session: string;
}

export type Requestable = SessionKey | string;

export function isSessionKey(
  value: unknown | Requestable
): value is SessionKey {
  return typeof value !== "string";
}

export class LastFMAPIService extends BaseService {
  private mirrorballCacheService = new MirrorballCacheService(this.logger);

  url = "https://ws.audioscrobbler.com/2.0/";

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

  async _recentTracks(params: RecentTracksParams): Promise<RawRecentTracks> {
    return (
      await this.request<RawRecentTracksResponse>(
        "user.getrecenttracks",
        params
      )
    ).recenttracks;
  }

  async _recentTracksExtended(
    params: RecentTracksParams
  ): Promise<RawRecentTracksExtended> {
    return await this.request<RawRecentTracksExtended>("user.getrecenttracks", {
      ...params,
      extended: 1,
    });
  }

  async _trackInfo(params: TrackInfoParams): Promise<RawTrackInfo> {
    let response = (
      await this.request<RawTrackInfoResponse>("track.getInfo", params)
    ).track;

    if (
      response?.userplaycount !== undefined &&
      isNaN(toInt(response.userplaycount))
    )
      throw new BadLastFMResponseError();

    return response;
  }

  async _artistInfo(params: ArtistInfoParams): Promise<RawArtistInfo> {
    let response = (
      await this.request<RawArtistInfoResponse>("artist.getInfo", params, {
        post: true,
      })
    ).artist;

    this.mirrorballCacheService.cacheArtistInfo(response);

    if (
      params.username &&
      !!response?.stats?.userplaycount &&
      isNaN(toInt(response.stats.userplaycount))
    )
      throw new BadLastFMResponseError();

    return response;
  }

  async _albumInfo(params: AlbumInfoParams): Promise<RawAlbumInfo> {
    let response = (
      await this.request<RawAlbumInfoResponse>("album.getInfo", params)
    ).album;

    if (
      response?.userplaycount !== undefined &&
      isNaN(toInt(response.userplaycount))
    )
      throw new BadLastFMResponseError();

    return response;
  }

  async _userInfo(params: UserInfoParams): Promise<RawUserInfo> {
    return (await this.request<RawUserInfoResponse>("user.getInfo", params))
      .user;
  }

  async _tagInfo(params: TagInfoParams): Promise<RawTagInfo> {
    return (await this.request<RawTagInfoResponse>("tag.getInfo", params)).tag;
  }

  async _topArtists(params: TopArtistsParams): Promise<RawTopArtists> {
    return (
      await this.request<RawTopArtistsResponse>("user.getTopArtists", {
        limit: 50,
        page: 1,
        period: "overall",
        ...params,
      })
    ).topartists;
  }

  async _topAlbums(params: TopAlbumsParams): Promise<RawTopAlbums> {
    return (
      await this.request<RawTopAlbumsResponse>("user.getTopAlbums", {
        limit: 50,
        page: 1,
        period: "overall",
        ...params,
      })
    ).topalbums;
  }

  async _topTracks(params: TopTracksParams): Promise<RawTopTracks> {
    return (
      await this.request<RawTopTracksResponse>("user.getTopTracks", {
        page: 1,
        limit: 50,
        period: "overall",
        ...params,
      })
    ).toptracks;
  }

  async _artistPopularTracks(
    params: ArtistPopularTracksParams
  ): Promise<RawArtistPopularTracks> {
    let response = await this.request<RawArtistPopularTracksResponse>(
      "artist.getTopTracks",
      params
    );

    return response.toptracks;
  }

  async _tagTopArtists(params: TagTopArtistsParams): Promise<RawTagTopArtists> {
    let response = await this.request<RawTagTopArtistsResponse>(
      "tag.gettopartists",
      params
    );

    this.mirrorballCacheService.cacheTagTopArtists(response.topartists);

    return response.topartists;
  }

  async _trackSearch(
    params: TrackSearchParams
  ): Promise<RawTrackSearchResponse> {
    let response = await this.request<RawTrackSearchResponse>(
      "track.search",
      this.cleanSearchParams<TrackSearchParams>(params)
    );

    return response;
  }

  async _getArtistCorrection(
    params: GetArtistCorrectionParams
  ): Promise<RawArtistCorrection> {
    let response = await this.request<RawGetArtistCorrectionResponse>(
      "artist.getCorrection",
      params
    );

    if (!response.corrections?.correction)
      throw new RecordNotFoundError("artist");

    return response.corrections.correction.artist;
  }

  async _userGetFriends(params: UserGetFriendsParams): Promise<RawFriends> {
    try {
      return (
        await this.request<RawUserGetFriendsResponse>("user.getFriends", params)
      ).friends;
    } catch (e) {
      if (e.response?.message === "no such page") {
        return {
          user: [],
          "@attr": {
            page: "0",
            perPage: "0",
            totalPages: "0",
            total: "0",
            user: typeof params.username === "string" ? params.username : "",
          },
        };
      } else throw e;
    }
  }

  async _tagTopTracks(params: TagTopTracksParams): Promise<RawTagTopTracks> {
    return (
      await this.request<RawTagTopTracksResponse>("tag.getTopTracks", params)
    ).tracks;
  }

  async love(params: TrackLoveParams): Promise<void> {
    return await this.request("track.love", params, { post: true });
  }

  private async request<T>(
    method: string,
    params: Params,
    options: { post?: boolean; forceSignature?: boolean } = {
      post: false,
      forceSignature: false,
    }
  ): Promise<T> {
    let builtParams = this.parseUsername({
      ...this.defaultParams,
      ...params,
      method,
    });

    if (!options.forceSignature && !builtParams.sk) {
      return await this.unauthedRequest<T>(method, params);
    }

    let signature = Object.keys(builtParams)
      .filter((k) => k !== "format")
      .sort()
      .map((k) => `${k}${(builtParams as any)[k]}`)
      .join("");

    let api_sig = crypto
      .createHash("md5")
      .update(`${signature}${config.lastFMSecret}`, "utf8")
      .digest("hex");

    return await this.unauthedRequest<T>(
      method,
      { ...builtParams, api_sig },
      {
        method: options.post ? "POST" : "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
  }

  private async unauthedRequest<T>(
    method: string,
    params: Params,
    fetchOptions?: RequestInit
  ): Promise<T> {
    this.log(
      `made ${
        (params as any).sk ? "authenticated " : ""
      }API request for ${method} with params ${JSON.stringify(
        this.cleanParametersForDisplay(params)
      )}`
    );

    const qparams = (params as any).api_key
      ? stringify({ ...params })
      : this.buildParams({ method, ...params });

    const response = await fetch(this.url + "?" + qparams, fetchOptions);

    if (`${response.status}`.startsWith("3"))
      throw new LastFMConnectionError(response);

    const jsonResponse = await response.json();

    if (jsonResponse.error) throw new LastFMError(jsonResponse);

    return jsonResponse as T;
  }

  async getToken(): Promise<{ token: string }> {
    return await this.request("auth.getToken", {}, { forceSignature: true });
  }

  async _getSession(params: GetSessionParams): Promise<RawLastFMSession> {
    return await this.request("auth.getSession", params, {
      forceSignature: true,
    });
  }

  async scrobbleTrack(params: ScrobbleParams, sk?: string) {
    return await this.request(
      "track.scrobble",
      {
        ...params,
        sk: sk || config.lastFMVerificationSessionKey,
      },
      { post: true }
    );
  }

  // private methods
  private cleanSearchParams<T = any>(params: any): T {
    if (params.track) params.track = params.track.replace(":", " ");
    if (params.artist) params.artist = params.artist.replace(":", " ");
    if (params.album) params.album = params.album.replace(":", " ");

    return params as T;
  }

  private parseUsername(params: { [key: string]: any }): {
    [key: string]: any;
  } {
    const username = params.username as Requestable | undefined;

    if (!username || !isSessionKey(username)) {
      return params;
    }

    return { ...params, username: username.username, sk: username.session };
  }

  private cleanParametersForDisplay(params: { [key: string]: any }): {
    [key: string]: any;
  } {
    return Object.entries(params)
      .filter(([key]) => !["api_sig", "api_key", "format", "sk"].includes(key))
      .reduce((acc, [key, val]) => {
        acc[key] = val;

        return acc;
      }, {} as any);
  }
}
