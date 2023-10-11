import crypto from "crypto";
import fetch, { RequestInit, Response } from "node-fetch";
import { stringify } from "querystring";
import config from "../../../config.json";
import { AnalyticsCollector } from "../../analytics/AnalyticsCollector";
import {
  BadLastFMResponseError,
  LastFMConnectionError,
  LastFMError,
} from "../../errors/errors";
import { toInt } from "../../helpers/lastfm/";
import { SimpleMap } from "../../helpers/types";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";
import { LilacTagsService } from "../lilac/LilacTagsService";
import {
  AlbumInfoParams,
  AlbumSearchParams,
  ArtistInfoParams,
  ArtistPopularTracksParams,
  GetArtistCorrectionParams,
  GetSessionParams,
  Params,
  RawAlbumInfo,
  RawAlbumInfoResponse,
  RawAlbumSearchResponse,
  RawArtistCorrection,
  RawArtistInfo,
  RawArtistInfoResponse,
  RawArtistPopularTracks,
  RawArtistPopularTracksResponse,
  RawFriends,
  RawGetArtistCorrectionResponse,
  RawLastFMErrorResponse,
  RawLastFMSession,
  RawRecentTracks,
  RawRecentTracksExtended,
  RawRecentTracksResponse,
  RawTagInfo,
  RawTagInfoResponse,
  RawTagTopAlbums,
  RawTagTopAlbumsResponse,
  RawTagTopArtists,
  RawTagTopArtistsResponse,
  RawTagTopTracks,
  RawTagTopTracksResponse,
  RawTopAlbums,
  RawTopAlbumsResponse,
  RawTopArtists,
  RawTopArtistsResponse,
  RawTopTracks,
  RawTopTracksResponse,
  RawTrackInfo,
  RawTrackInfoResponse,
  RawTrackSearchResponse,
  RawUserGetFriendsResponse,
  RawUserGetWeeklyAlbumChart,
  RawUserGetWeeklyArtistChart,
  RawUserGetWeeklyTrackChart,
  RawUserInfo,
  RawUserInfoResponse,
  RecentTracksParams,
  ScrobbleParams,
  TagInfoParams,
  TagTopArtistsParams,
  TagTopEntitiesParams,
  TopAlbumsParams,
  TopArtistsParams,
  TopTracksParams,
  TrackInfoParams,
  TrackLoveParams,
  TrackSearchParams,
  UserGetFriendsParams,
  UserGetWeeklyChartParams,
  UserInfoParams,
  isErrorResponse,
} from "./LastFMService.types";
import { LovedTrackService } from "./LovedTrackService";

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
  private get lilacTagsService() {
    return ServiceRegistry.get(LilacTagsService);
  }

  private get analyticsCollector() {
    return ServiceRegistry.get(AnalyticsCollector);
  }

  get lovedTrackService() {
    return ServiceRegistry.get(LovedTrackService);
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
    ctx: GowonContext,
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
    ctx: GowonContext,
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
    ctx: GowonContext,
    params: TrackInfoParams
  ): Promise<RawTrackInfo> {
    const response = (
      await this.request<RawTrackInfoResponse>(ctx, "track.getInfo", params)
    ).track;

    try {
      this.lovedTrackService.resolveCache(response);
    } catch {}

    if (
      response?.userplaycount !== undefined &&
      isNaN(toInt(response.userplaycount))
    ) {
      throw new BadLastFMResponseError();
    }

    return response;
  }

  async _artistInfo(
    ctx: GowonContext,
    params: ArtistInfoParams
  ): Promise<RawArtistInfo> {
    const response = (
      await this.request<RawArtistInfoResponse>(ctx, "artist.getInfo", params, {
        post: true,
      })
    ).artist;

    this.lilacTagsService.cacheArtistInfo(ctx, response);

    if (
      params.username &&
      !!response?.stats?.userplaycount &&
      isNaN(toInt(response.stats.userplaycount))
    )
      throw new BadLastFMResponseError();

    return response;
  }

  async _albumInfo(
    ctx: GowonContext,
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
    ctx: GowonContext,
    params: UserInfoParams
  ): Promise<RawUserInfo> {
    return (
      await this.request<RawUserInfoResponse>(ctx, "user.getInfo", params)
    ).user;
  }

  async _tagInfo(
    ctx: GowonContext,
    params: TagInfoParams
  ): Promise<RawTagInfo> {
    return (await this.request<RawTagInfoResponse>(ctx, "tag.getInfo", params))
      .tag;
  }

  async _topArtists(
    ctx: GowonContext,
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
    ctx: GowonContext,
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
    ctx: GowonContext,
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
    ctx: GowonContext,
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
    ctx: GowonContext,
    params: TagTopArtistsParams
  ): Promise<RawTagTopArtists> {
    let response = await this.request<RawTagTopArtistsResponse>(
      ctx,
      "tag.gettopartists",
      params
    );

    this.lilacTagsService.cacheTagTopArtists(ctx, response.topartists);

    return response.topartists;
  }

  async _trackSearch(
    ctx: GowonContext,
    params: TrackSearchParams
  ): Promise<RawTrackSearchResponse> {
    return await this.request<RawTrackSearchResponse>(
      ctx,
      "track.search",
      this.cleanSearchParams<TrackSearchParams>(params)
    );
  }

  async _albumSearch(
    ctx: GowonContext,
    params: AlbumSearchParams
  ): Promise<RawAlbumSearchResponse> {
    return await this.request<RawAlbumSearchResponse>(
      ctx,
      "album.search",
      this.cleanSearchParams<AlbumSearchParams>(params)
    );
  }

  async _getArtistCorrection(
    ctx: GowonContext,
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
    ctx: GowonContext,
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
    ctx: GowonContext,
    params: TagTopEntitiesParams
  ): Promise<RawTagTopTracks> {
    return (
      await this.request<RawTagTopTracksResponse>(
        ctx,
        "tag.getTopTracks",
        params
      )
    ).tracks;
  }

  async _tagTopAlbums(
    ctx: GowonContext,
    params: TagTopEntitiesParams
  ): Promise<RawTagTopAlbums> {
    return (
      await this.request<RawTagTopAlbumsResponse>(
        ctx,
        "tag.getTopAlbums",
        params
      )
    ).albums;
  }

  async _userGetWeeklyArtistChart(
    ctx: GowonContext,
    params: UserGetWeeklyChartParams
  ): Promise<RawUserGetWeeklyArtistChart> {
    return await this.request(ctx, "user.getWeeklyArtistChart", params);
  }

  async _userGetWeeklyAlbumChart(
    ctx: GowonContext,
    params: UserGetWeeklyChartParams
  ): Promise<RawUserGetWeeklyAlbumChart> {
    return await this.request(ctx, "user.getWeeklyAlbumChart", params);
  }

  async _userGetWeeklyTrackChart(
    ctx: GowonContext,
    params: UserGetWeeklyChartParams
  ): Promise<RawUserGetWeeklyTrackChart> {
    return await this.request(ctx, "user.getWeeklyTrackChart", params);
  }

  async love(ctx: GowonContext, params: TrackLoveParams): Promise<void> {
    await this.request(ctx, "track.love", params, {
      post: true,
    });
  }

  async unlove(ctx: GowonContext, params: TrackLoveParams): Promise<void> {
    await this.request(ctx, "track.unlove", params, { post: true });
  }

  async scrobble(ctx: GowonContext, params: ScrobbleParams): Promise<void> {
    return await this.request(ctx, "track.scrobble", params, { post: true });
  }

  private async request<T>(
    ctx: GowonContext,
    method: string,
    params: Params,
    options: { post?: boolean; forceSignature?: boolean } = {
      post: false,
      forceSignature: false,
    }
  ): Promise<T> {
    let builtParams = this.parseUsername({
      ...this.defaultParams,
      ...this.filterParams(params),
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
    ctx: GowonContext,
    method: string,
    params: Params,
    fetchOptions?: RequestInit,
    isRetry = false
  ): Promise<T> {
    this.log(
      ctx,
      `${isRetry ? "RETRY - " : ""}made ${
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

    if (`${response.status}`.startsWith("3")) {
      throw new LastFMConnectionError(response);
    }

    const jsonResponse = await this.getJSON<T>(response);

    if (isErrorResponse(jsonResponse)) {
      // Retry
      if (!isRetry && jsonResponse.error === 8 && !ctx.client.isInIssueMode) {
        return await this.unauthedRequest(
          ctx,
          method,
          params,
          fetchOptions,
          true
        );
      }

      throw new LastFMError(jsonResponse, ctx.client.isInIssueMode);
    }

    return jsonResponse as T;
  }

  private async getJSON<T>(
    response: Response
  ): Promise<T | RawLastFMErrorResponse> {
    try {
      return (await response.json()) as T | RawLastFMErrorResponse;
    } catch (e) {
      throw new BadLastFMResponseError();
    }
  }

  async getToken(ctx: GowonContext): Promise<{ token: string }> {
    return await this.request(
      ctx,
      "auth.getToken",
      {},
      { forceSignature: true }
    );
  }

  async _getSession(
    ctx: GowonContext,
    params: GetSessionParams
  ): Promise<RawLastFMSession> {
    return await this.request(ctx, "auth.getSession", params, {
      forceSignature: true,
    });
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

  private filterParams(params: SimpleMap): SimpleMap {
    return Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }

      return acc;
    }, {} as SimpleMap);
  }
}
