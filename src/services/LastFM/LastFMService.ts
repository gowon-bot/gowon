import { add } from "date-fns";
import { BadLastFMResponseError, LogicError } from "../../errors/errors";
import { code } from "../../helpers/discord";
import { requestableAsUsername } from "../../lib/MultiRequester";
import { GowonContext } from "../../lib/context/Context";
import { displayNumber } from "../../lib/views/displays";
import { LastFMAPIService, Requestable } from "./LastFMAPIService";
import {
  AlbumInfoParams,
  AlbumSearchParams,
  ArtistInfoParams,
  ArtistPopularTracksParams,
  GetArtistCorrectionParams,
  GetSessionParams,
  LastFMPeriod,
  RecentTracksParams,
  TagInfoParams,
  TagTopArtistsParams,
  TagTopEntitiesParams,
  TopAlbumsParams,
  TopArtistsParams,
  TopTracksParams,
  TrackInfoParams,
  TrackSearchParams,
  UserGetFriendsParams,
  UserGetWeeklyChartParams,
  UserInfoParams,
  isTimeframeParams,
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
  TagTopAlbums,
  TagTopArtists,
  TagTopTracks,
} from "./converters/Misc";
import { RecentTrack, RecentTracks } from "./converters/RecentTracks";
import { AlbumSearch, TrackSearch } from "./converters/Search";
import { TopAlbums, TopArtists, TopTracks } from "./converters/TopTypes";

export class LastFMService extends LastFMAPIService {
  async artistInfo(
    ctx: GowonContext,
    params: ArtistInfoParams
  ): Promise<ArtistInfo> {
    let response: ArtistInfo;

    response = new ArtistInfo(await this._artistInfo(ctx, params));

    return response;
  }

  async albumInfo(
    ctx: GowonContext,
    params: AlbumInfoParams
  ): Promise<AlbumInfo> {
    return new AlbumInfo(await this._albumInfo(ctx, params));
  }

  async trackInfo(
    ctx: GowonContext,
    params: TrackInfoParams
  ): Promise<TrackInfo> {
    const trackInfo = new TrackInfo(await this._trackInfo(ctx, params));

    return trackInfo;
  }

  async userInfo(ctx: GowonContext, params: UserInfoParams): Promise<UserInfo> {
    return new UserInfo(await this._userInfo(ctx, params));
  }

  async tagInfo(ctx: GowonContext, params: TagInfoParams): Promise<TagInfo> {
    return new TagInfo(await this._tagInfo(ctx, params));
  }

  async topArtists(
    ctx: GowonContext,
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
    ctx: GowonContext,
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
    ctx: GowonContext,
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
    ctx: GowonContext,
    params: RecentTracksParams
  ): Promise<RecentTracks> {
    return new RecentTracks(await this._recentTracks(ctx, params));
  }

  async artistPopularTracks(
    ctx: GowonContext,
    params: ArtistPopularTracksParams
  ): Promise<ArtistPopularTracks> {
    return new ArtistPopularTracks(
      await this._artistPopularTracks(ctx, params)
    );
  }

  async tagTopArtists(
    ctx: GowonContext,
    params: TagTopArtistsParams
  ): Promise<TagTopArtists> {
    return new TagTopArtists(await this._tagTopArtists(ctx, params));
  }

  async trackSearch(
    ctx: GowonContext,
    params: TrackSearchParams
  ): Promise<TrackSearch> {
    return new TrackSearch(await this._trackSearch(ctx, params));
  }

  async albumSearch(
    ctx: GowonContext,
    params: AlbumSearchParams
  ): Promise<AlbumSearch> {
    return new AlbumSearch(await this._albumSearch(ctx, params));
  }

  async getArtistCorrection(
    ctx: GowonContext,
    params: GetArtistCorrectionParams
  ): Promise<ArtistCorrection> {
    return new ArtistCorrection(await this._getArtistCorrection(ctx, params));
  }

  async userGetFriends(
    ctx: GowonContext,
    params: UserGetFriendsParams
  ): Promise<Friends> {
    return new Friends(await this._userGetFriends(ctx, params));
  }

  async tagTopTracks(
    ctx: GowonContext,
    params: TagTopEntitiesParams
  ): Promise<TagTopTracks> {
    return new TagTopTracks(await this._tagTopTracks(ctx, params));
  }

  async tagTopAlbums(
    ctx: GowonContext,
    params: TagTopEntitiesParams
  ): Promise<TagTopAlbums> {
    return new TagTopAlbums(await this._tagTopAlbums(ctx, params));
  }

  async getSession(
    ctx: GowonContext,
    params: GetSessionParams
  ): Promise<LastFMSession> {
    return new LastFMSession(await this._getSession(ctx, params));
  }

  // Derived methods
  async nowPlaying(
    ctx: GowonContext,
    username: Requestable
  ): Promise<RecentTrack> {
    return (await this.recentTracks(ctx, { limit: 1, username })).first();
  }

  async getArtistPlays(
    ctx: GowonContext,
    username: Requestable,
    artist: string
  ): Promise<number> {
    let playcount = (await this.artistInfo(ctx, { artist, username }))
      ?.userPlaycount;

    if (isNaN(playcount)) throw new BadLastFMResponseError();

    return playcount;
  }

  async doesUserExist(
    ctx: GowonContext,
    username: Requestable
  ): Promise<boolean> {
    try {
      const user = await this.userInfo(ctx, { username });

      return !!user.name;
    } catch (e: any) {
      if (e.name === "LastFMConnectionError" || e.name === "LastFMError:8") {
        return false;
      }
      throw e;
    }
  }

  async correctArtist(
    ctx: GowonContext,
    params: ArtistInfoParams
  ): Promise<string> {
    return (await this.artistInfo(ctx, params)).name;
  }

  async correctAlbum(
    ctx: GowonContext,
    params: AlbumInfoParams
  ): Promise<{ artist: string; album: string }> {
    let response = await this.albumInfo(ctx, params);

    return {
      artist: response.artist,
      album: response.name,
    };
  }

  async correctTrack(
    ctx: GowonContext,
    params: TrackInfoParams
  ): Promise<{ artist: string; track: string }> {
    let response = await this.trackInfo(ctx, params);

    return {
      artist: response.artist.name,
      track: response.name,
    };
  }

  async getArtistTags(ctx: GowonContext, artist: string): Promise<string[]> {
    try {
      return (await this.artistInfo(ctx, { artist }))?.tags || [];
    } catch {
      return [];
    }
  }

  async artistCount(
    ctx: GowonContext,
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
    ctx: GowonContext,
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
    ctx: GowonContext,
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
    ctx: GowonContext,
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
        `${code(
          requestableAsUsername(username)
        )} hasn't scrobbled ${displayNumber(milestone, "track")} yet!`
      );
    }

    return response.tracks[1] ?? response.first();
  }

  async getNumberScrobbles(
    ctx: GowonContext,
    username: Requestable,
    from?: Date,
    to?: Date
  ): Promise<number> {
    let params: RecentTracksParams = { username, limit: 1 };

    if (from) params.from = ~~(from.getTime() / 1000);
    if (to) params.to = ~~(to.getTime() / 1000);

    const recentTracks = await this.recentTracks(ctx, params);

    return recentTracks.meta.total || 0;
  }

  async goBack(
    ctx: GowonContext,
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
