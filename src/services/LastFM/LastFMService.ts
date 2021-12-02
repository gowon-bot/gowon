import { add } from "date-fns";
import { BadLastFMResponseError, LogicError } from "../../errors";
import { LastFMAPIService, Requestable } from "./LastFMAPIService";
import {
  AlbumInfoParams,
  ArtistInfoParams,
  ArtistPopularTracksParams,
  GetArtistCorrectionParams,
  GetSessionParams,
  isTimeframeParams,
  LastFMPeriod,
  RecentTracksParams,
  TagInfoParams,
  TagTopArtistsParams,
  TagTopTracksParams,
  TopAlbumsParams,
  TopArtistsParams,
  TopTracksParams,
  TrackInfoParams,
  TrackSearchParams,
  UserGetFriendsParams,
  UserGetWeeklyChartParams,
  UserInfoParams,
} from "./LastFMService.types";
import {
  AlbumInfo,
  ArtistInfo,
  TagInfo,
  TrackInfo,
  UserInfo,
} from "./converters/InfoTypes";
import {
  ArtistCorrection,
  ArtistPopularTracks,
  Friends,
  LastFMSession,
  TagTopArtists,
  TagTopTracks,
  TrackSearch,
} from "./converters/Misc";
import { RecentTrack, RecentTracks } from "./converters/RecentTracks";
import { TopAlbums, TopArtists, TopTracks } from "./converters/TopTypes";
import { displayNumber } from "../../lib/views/displays";
import { requestableAsUsername } from "../../lib/MultiRequester";
import { BaseServiceContext } from "../BaseService";

export class LastFMService extends LastFMAPIService {
  async artistInfo(
    ctx: BaseServiceContext,
    params: ArtistInfoParams
  ): Promise<ArtistInfo> {
    let response: ArtistInfo;

    response = new ArtistInfo(await this._artistInfo(ctx, params));

    return response;
  }

  async albumInfo(
    ctx: BaseServiceContext,
    params: AlbumInfoParams
  ): Promise<AlbumInfo> {
    return new AlbumInfo(await this._albumInfo(ctx, params));
  }

  async trackInfo(
    ctx: BaseServiceContext,
    params: TrackInfoParams
  ): Promise<TrackInfo> {
    return new TrackInfo(await this._trackInfo(ctx, params));
  }

  async userInfo(
    ctx: BaseServiceContext,
    params: UserInfoParams
  ): Promise<UserInfo> {
    return new UserInfo(await this._userInfo(ctx, params));
  }

  async tagInfo(
    ctx: BaseServiceContext,
    params: TagInfoParams
  ): Promise<TagInfo> {
    return new TagInfo(await this._tagInfo(ctx, params));
  }

  async topArtists(
    ctx: BaseServiceContext,
    params: TopArtistsParams | UserGetWeeklyChartParams
  ): Promise<TopArtists> {
    if (isTimeframeParams(params)) {
      return TopArtists.fromWeeklyChart(
        await this._userGetWeeklyArtistChart(ctx, params)
      );
    }

    return new TopArtists(await this._topArtists(ctx, params));
  }

  async topAlbums(
    ctx: BaseServiceContext,
    params: TopAlbumsParams | UserGetWeeklyChartParams
  ): Promise<TopAlbums> {
    if (isTimeframeParams(params)) {
      return TopAlbums.fromWeeklyChart(
        await this._userGetWeeklyAlbumChart(ctx, params)
      );
    }

    return new TopAlbums(await this._topAlbums(ctx, params));
  }

  async topTracks(
    ctx: BaseServiceContext,
    params: TopTracksParams | UserGetWeeklyChartParams
  ): Promise<TopTracks> {
    if (isTimeframeParams(params)) {
      return TopTracks.fromWeeklyChart(
        await this._userGetWeeklyTrackChart(ctx, params)
      );
    }

    return new TopTracks(await this._topTracks(ctx, params));
  }

  async recentTracks(
    ctx: BaseServiceContext,
    params: RecentTracksParams
  ): Promise<RecentTracks> {
    return new RecentTracks(await this._recentTracks(ctx, params));
  }

  async artistPopularTracks(
    ctx: BaseServiceContext,
    params: ArtistPopularTracksParams
  ): Promise<ArtistPopularTracks> {
    return new ArtistPopularTracks(
      await this._artistPopularTracks(ctx, params)
    );
  }

  async tagTopArtists(
    ctx: BaseServiceContext,
    params: TagTopArtistsParams
  ): Promise<TagTopArtists> {
    return new TagTopArtists(await this._tagTopArtists(ctx, params));
  }

  async trackSearch(
    ctx: BaseServiceContext,
    params: TrackSearchParams
  ): Promise<TrackSearch> {
    return new TrackSearch(await this._trackSearch(ctx, params));
  }

  async getArtistCorrection(
    ctx: BaseServiceContext,
    params: GetArtistCorrectionParams
  ): Promise<ArtistCorrection> {
    return new ArtistCorrection(await this._getArtistCorrection(ctx, params));
  }

  async userGetFriends(
    ctx: BaseServiceContext,
    params: UserGetFriendsParams
  ): Promise<Friends> {
    return new Friends(await this._userGetFriends(ctx, params));
  }

  async tagTopTracks(
    ctx: BaseServiceContext,
    params: TagTopTracksParams
  ): Promise<TagTopTracks> {
    return new TagTopTracks(await this._tagTopTracks(ctx, params));
  }

  async getSession(
    ctx: BaseServiceContext,
    params: GetSessionParams
  ): Promise<LastFMSession> {
    return new LastFMSession(await this._getSession(ctx, params));
  }

  // Derived methods
  async nowPlaying(
    ctx: BaseServiceContext,
    username: Requestable
  ): Promise<RecentTrack> {
    return (await this.recentTracks(ctx, { limit: 1, username })).first();
  }

  async getArtistPlays(
    ctx: BaseServiceContext,
    username: Requestable,
    artist: string
  ): Promise<number> {
    let playcount = (await this.artistInfo(ctx, { artist, username }))
      ?.userPlaycount;

    if (isNaN(playcount)) throw new BadLastFMResponseError();

    return playcount;
  }

  async userExists(
    ctx: BaseServiceContext,
    username: Requestable
  ): Promise<boolean> {
    try {
      let user = await this.userInfo(ctx, { username });

      return !!user.name;
    } catch (e: any) {
      if (e.name === "LastFMConnectionError" || e.name === "LastFMError:8") {
        return false;
      }
      throw e;
    }
  }

  async correctArtist(
    ctx: BaseServiceContext,
    params: ArtistInfoParams
  ): Promise<string> {
    return (await this.artistInfo(ctx, params)).name;
  }

  async correctAlbum(
    ctx: BaseServiceContext,
    params: AlbumInfoParams
  ): Promise<{ artist: string; album: string }> {
    let response = await this.albumInfo(ctx, params);

    return {
      artist: response.artist,
      album: response.name,
    };
  }

  async correctTrack(
    ctx: BaseServiceContext,
    params: TrackInfoParams
  ): Promise<{ artist: string; track: string }> {
    let response = await this.trackInfo(ctx, params);

    return {
      artist: response.artist.name,
      track: response.name,
    };
  }

  async getArtistTags(
    ctx: BaseServiceContext,
    artist: string
  ): Promise<string[]> {
    try {
      return (await this.artistInfo(ctx, { artist }))?.tags || [];
    } catch {
      return [];
    }
  }

  async artistCount(
    ctx: BaseServiceContext,
    username: Requestable,
    timePeriod: LastFMPeriod = "overall"
  ): Promise<number> {
    let topArtists = await this.topArtists(ctx, {
      username,
      limit: 1,
      period: timePeriod,
    });

    return topArtists.meta.total || 0;
  }

  async albumCount(
    ctx: BaseServiceContext,
    username: Requestable,
    timePeriod: LastFMPeriod = "overall"
  ): Promise<number> {
    let topArtists = await this.topAlbums(ctx, {
      username,
      limit: 1,
      period: timePeriod,
    });

    return topArtists.meta.total || 0;
  }

  async trackCount(
    ctx: BaseServiceContext,
    username: Requestable,
    timePeriod: LastFMPeriod = "overall"
  ): Promise<number> {
    let topTracks = await this.topTracks(ctx, {
      username,
      limit: 1,
      period: timePeriod,
    });

    return topTracks.meta.total || 0;
  }

  async getMilestone(
    ctx: BaseServiceContext,
    username: Requestable,
    milestone: number
  ): Promise<RecentTrack> {
    let total = (await this.recentTracks(ctx, { username, limit: 1 })).meta
      .total;

    let response = await this.recentTracks(ctx, {
      username,
      page: total - milestone + 1,
      limit: 1,
    });

    if (milestone > response.meta.total) {
      throw new LogicError(
        `${requestableAsUsername(username)} hasn't scrobbled ${displayNumber(
          milestone,
          "track"
        )} yet!`
      );
    }

    return response.tracks[1] ?? response.first();
  }

  async getNumberScrobbles(
    ctx: BaseServiceContext,
    username: Requestable,
    from?: Date,
    to?: Date
  ): Promise<number> {
    let params: RecentTracksParams = { username, limit: 1 };

    if (from) params.from = ~~(from.getTime() / 1000);
    if (to) params.to = ~~(to.getTime() / 1000);

    let recentTracks = await this.recentTracks(ctx, params);

    return recentTracks.meta.total || 0;
  }

  async goBack(
    ctx: BaseServiceContext,
    username: Requestable,
    when: Date
  ): Promise<RecentTrack> {
    let to = add(when, { hours: 6 });

    let params = {
      username,
      limit: 1,
      from: ~~(when.getTime() / 1000),
      to: ~~(to.getTime() / 1000),
    };

    let recentTracks = await this.recentTracks(ctx, params);

    return recentTracks.tracks[1] ?? recentTracks.first();
  }
}
