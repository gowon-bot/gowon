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
} from "../../errors";
import { BaseService, BaseServiceContext } from "../BaseService";
import { toInt } from "../../helpers/lastFM";
import { MirrorballCacheService } from "../mirrorball/MirrorballCacheService";
import { SimpleMap } from "../../helpers/types";
import { ServiceRegistry } from "../ServicesRegistry";
import { AnalyticsCollector } from "../../analytics/AnalyticsCollector";

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
  private get mirrorballCacheService() {
    return ServiceRegistry.get(MirrorballCacheService);
  }

  private get analyticsCollector() {
    return ServiceRegistry.get(AnalyticsCollector);
  }

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

  async _recentTracks(
    ctx: BaseServiceContext,
    params: RecentTracksParams
  ): Promise<RawRecentTracks> {
    return (
      await this.request<RawRecentTracksResponse>(
        ctx,
        "user.getrecenttracks",
        params
      )
    ).recenttracks;
  }

  async _recentTracksExtended(
    ctx: BaseServiceContext,
    params: RecentTracksParams
  ): Promise<RawRecentTracksExtended> {
    return await this.request<RawRecentTracksExtended>(
      ctx,
      "user.getrecenttracks",
      {
        ...params,
        extended: 1,
      }
    );
  }

  async _trackInfo(
    ctx: BaseServiceContext,
    params: TrackInfoParams
  ): Promise<RawTrackInfo> {
    let response = (
      await this.request<RawTrackInfoResponse>(ctx, "track.getInfo", params)
    ).track;

    if (
      response?.userplaycount !== undefined &&
      isNaN(toInt(response.userplaycount))
    )
      throw new BadLastFMResponseError();

    return response;
  }

  async _artistInfo(
    ctx: BaseServiceContext,
    params: ArtistInfoParams
  ): Promise<RawArtistInfo> {
    let response = (
      await this.request<RawArtistInfoResponse>(ctx, "artist.getInfo", params, {
        post: true,
      })
    ).artist;

    this.mirrorballCacheService.cacheArtistInfo(ctx, response);

    if (
      params.username &&
      !!response?.stats?.userplaycount &&
      isNaN(toInt(response.stats.userplaycount))
    )
      throw new BadLastFMResponseError();

    return response;
  }

  async _albumInfo(
    ctx: BaseServiceContext,
    params: AlbumInfoParams
  ): Promise<RawAlbumInfo> {
    let response = (
      await this.request<RawAlbumInfoResponse>(ctx, "album.getInfo", params)
    ).album;

    if (
      response?.userplaycount !== undefined &&
      isNaN(toInt(response.userplaycount))
    )
      throw new BadLastFMResponseError();

    return response;
  }

  async _userInfo(
    ctx: BaseServiceContext,
    params: UserInfoParams
  ): Promise<RawUserInfo> {
    return (
      await this.request<RawUserInfoResponse>(ctx, "user.getInfo", params)
    ).user;
  }

  async _tagInfo(
    ctx: BaseServiceContext,
    params: TagInfoParams
  ): Promise<RawTagInfo> {
    return (await this.request<RawTagInfoResponse>(ctx, "tag.getInfo", params))
      .tag;
  }

  async _topArtists(
    ctx: BaseServiceContext,
    params: TopArtistsParams
  ): Promise<RawTopArtists> {
    return (
      await this.request<RawTopArtistsResponse>(ctx, "user.getTopArtists", {
        limit: 50,
        page: 1,
        period: "overall",
        ...params,
      })
    ).topartists;
  }

  async _topAlbums(
    ctx: BaseServiceContext,
    params: TopAlbumsParams
  ): Promise<RawTopAlbums> {
    return (
      await this.request<RawTopAlbumsResponse>(ctx, "user.getTopAlbums", {
        limit: 50,
        page: 1,
        period: "overall",
        ...params,
      })
    ).topalbums;
  }

  async _topTracks(
    ctx: BaseServiceContext,
    params: TopTracksParams
  ): Promise<RawTopTracks> {
    return (
      await this.request<RawTopTracksResponse>(ctx, "user.getTopTracks", {
        page: 1,
        limit: 50,
        period: "overall",
        ...params,
      })
    ).toptracks;
  }

  async _artistPopularTracks(
    ctx: BaseServiceContext,
    params: ArtistPopularTracksParams
  ): Promise<RawArtistPopularTracks> {
    let response = await this.request<RawArtistPopularTracksResponse>(
      ctx,
      "artist.getTopTracks",
      params
    );

    return response.toptracks;
  }

  async _tagTopArtists(
    ctx: BaseServiceContext,
    params: TagTopArtistsParams
  ): Promise<RawTagTopArtists> {
    let response = await this.request<RawTagTopArtistsResponse>(
      ctx,
      "tag.gettopartists",
      params
    );

    this.mirrorballCacheService.cacheTagTopArtists(ctx, response.topartists);

    return response.topartists;
  }

  async _trackSearch(
    ctx: BaseServiceContext,
    params: TrackSearchParams
  ): Promise<RawTrackSearchResponse> {
    let response = await this.request<RawTrackSearchResponse>(
      ctx,
      "track.search",
      this.cleanSearchParams<TrackSearchParams>(params)
    );

    return response;
  }

  async _getArtistCorrection(
    ctx: BaseServiceContext,
    params: GetArtistCorrectionParams
  ): Promise<RawArtistCorrection> {
    let response = await this.request<RawGetArtistCorrectionResponse>(
      ctx,
      "artist.getCorrection",
      params
    );

    // Last.fm doesn't throw an error when an artist doesn't exist
    if (!response.corrections?.correction)
      throw new LastFMError({ error: 6, message: "redirect" });

    return response.corrections.correction.artist;
  }

  async _userGetFriends(
    ctx: BaseServiceContext,
    params: UserGetFriendsParams
  ): Promise<RawFriends> {
    try {
      return (
        await this.request<RawUserGetFriendsResponse>(
          ctx,
          "user.getFriends",
          params
        )
      ).friends;
    } catch (e: any) {
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

  async _tagTopTracks(
    ctx: BaseServiceContext,
    params: TagTopTracksParams
  ): Promise<RawTagTopTracks> {
    return (
      await this.request<RawTagTopTracksResponse>(
        ctx,
        "tag.getTopTracks",
        params
      )
    ).tracks;
  }

  async love(ctx: BaseServiceContext, params: TrackLoveParams): Promise<void> {
    return await this.request(ctx, "track.love", params, { post: true });
  }

  private async request<T>(
    ctx: BaseServiceContext,
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
      return await this.unauthedRequest<T>(ctx, method, params);
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
      ctx,
      method,
      { ...builtParams, api_sig },
      {
        method: options.post ? "POST" : "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
  }

  private async unauthedRequest<T>(
    ctx: BaseServiceContext,
    method: string,
    params: Params,
    fetchOptions?: RequestInit
  ): Promise<T> {
    this.log(
      ctx,
      `made ${
        (params as any).sk ? "authenticated " : ""
      }API request for ${method} with params ${JSON.stringify(
        this.cleanParametersForDisplay(params)
      )}`
    );

    const qparams = (params as any).api_key
      ? stringify({ ...params })
      : this.buildParams({ method, ...params });

    const end = this.analyticsCollector.metrics.lastFMLatency.startTimer();
    const response = await fetch(this.url + "?" + qparams, fetchOptions);
    end({ category: method.split(".")[0], action: method.split(".")[1] });

    if (`${response.status}`.startsWith("3"))
      throw new LastFMConnectionError(response);

    const jsonResponse = await response.json();

    if (jsonResponse.error) throw new LastFMError(jsonResponse);

    return jsonResponse as T;
  }

  async getToken(ctx: BaseServiceContext): Promise<{ token: string }> {
    return await this.request(
      ctx,
      "auth.getToken",
      {},
      { forceSignature: true }
    );
  }

  async _getSession(
    ctx: BaseServiceContext,
    params: GetSessionParams
  ): Promise<RawLastFMSession> {
    return await this.request(ctx, "auth.getSession", params, {
      forceSignature: true,
    });
  }

  async scrobbleTrack(
    ctx: BaseServiceContext,
    params: ScrobbleParams,
    sk?: string
  ) {
    return await this.request(
      ctx,
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

  private parseUsername(params: SimpleMap): SimpleMap {
    const username = params.username as Requestable | undefined;

    if (!username || !isSessionKey(username)) {
      return params;
    }

    return { ...params, username: username.username, sk: username.session };
  }

  private cleanParametersForDisplay(params: SimpleMap): SimpleMap {
    return Object.entries(params)
      .filter(([key]) => !["api_sig", "api_key", "format", "sk"].includes(key))
      .reduce((acc, [key, val]) => {
        acc[key] = val;

        return acc;
      }, {} as any);
  }
}
