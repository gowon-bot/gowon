import { GowonContext } from "../../lib/context/Context";
import {
  AlbumInfoParams,
  ArtistInfoParams,
  ArtistPopularTracksParams,
  GetArtistCorrectionParams,
  GetSessionParams,
  Params,
  RawAlbumInfo,
  RawArtistCorrection,
  RawArtistInfo,
  RawArtistPopularTracks,
  RawFriends,
  RawLastFMSession,
  RawRecentTracks,
  RawRecentTracksExtended,
  RawTagInfo,
  RawTagTopArtists,
  RawTagTopTracks,
  RawTopAlbums,
  RawTopArtists,
  RawTopTracks,
  RawTrackInfo,
  RawTrackSearchResponse,
  RawUserGetWeeklyAlbumChart,
  RawUserGetWeeklyArtistChart,
  RawUserGetWeeklyTrackChart,
  RawUserInfo,
  RecentTracksParams,
  ScrobbleParams,
  TagInfoParams,
  TagTopArtistsParams,
  TagTopTracksParams,
  TopAlbumsParams,
  TopArtistsParams,
  TopTracksParams,
  TrackInfoParams,
  TrackLoveParams,
  TrackSearchParams,
  UserGetFriendsParams,
  UserGetWeeklyChartParams,
  UserInfoParams,
} from "../../services/LastFM/LastFMService.types";
import { BaseMockService } from "./BaseMockService";

export class MockLastFMAPIService extends BaseMockService {
  get apikey(): string {
    return "";
  }

  get defaultParams(): Params {
    return {};
  }

  buildParams(_params: Params): string {
    return "";
  }

  async _recentTracks(
    _ctx: GowonContext,
    _params: RecentTracksParams
  ): Promise<RawRecentTracks> {
    return {} as any;
  }

  async _recentTracksExtended(
    _ctx: GowonContext,
    _params: RecentTracksParams
  ): Promise<RawRecentTracksExtended> {
    return {} as any;
  }

  async _trackInfo(
    _ctx: GowonContext,
    _params: TrackInfoParams
  ): Promise<RawTrackInfo> {
    return {} as any;
  }

  async _artistInfo(
    _ctx: GowonContext,
    _params: ArtistInfoParams
  ): Promise<RawArtistInfo> {
    return {} as any;
  }

  async _albumInfo(
    _ctx: GowonContext,
    _params: AlbumInfoParams
  ): Promise<RawAlbumInfo> {
    return {} as any;
  }

  async _userInfo(
    _ctx: GowonContext,
    _params: UserInfoParams
  ): Promise<RawUserInfo> {
    return {} as any;
  }

  async _tagInfo(
    _ctx: GowonContext,
    _params: TagInfoParams
  ): Promise<RawTagInfo> {
    return {} as any;
  }

  async _topArtists(
    _ctx: GowonContext,
    _params: TopArtistsParams
  ): Promise<RawTopArtists> {
    return {} as any;
  }

  async _topAlbums(
    _ctx: GowonContext,
    _params: TopAlbumsParams
  ): Promise<RawTopAlbums> {
    return {} as any;
  }

  async _topTracks(
    _ctx: GowonContext,
    _params: TopTracksParams
  ): Promise<RawTopTracks> {
    return {} as any;
  }

  async _artistPopularTracks(
    _ctx: GowonContext,
    _params: ArtistPopularTracksParams
  ): Promise<RawArtistPopularTracks> {
    return {} as any;
  }

  async _tagTopArtists(
    _ctx: GowonContext,
    _params: TagTopArtistsParams
  ): Promise<RawTagTopArtists> {
    return {} as any;
  }

  async _trackSearch(
    _ctx: GowonContext,
    _params: TrackSearchParams
  ): Promise<RawTrackSearchResponse> {
    return {} as any;
  }

  async _getArtistCorrection(
    _ctx: GowonContext,
    _params: GetArtistCorrectionParams
  ): Promise<RawArtistCorrection> {
    return {} as any;
  }

  async _userGetFriends(
    _ctx: GowonContext,
    _params: UserGetFriendsParams
  ): Promise<RawFriends> {
    return {} as any;
  }

  async _tagTopTracks(
    _ctx: GowonContext,
    _params: TagTopTracksParams
  ): Promise<RawTagTopTracks> {
    return {} as any;
  }

  async _userGetWeeklyArtistChart(
    _ctx: GowonContext,
    _params: UserGetWeeklyChartParams
  ): Promise<RawUserGetWeeklyArtistChart> {
    return {} as any;
  }

  async _userGetWeeklyAlbumChart(
    _ctx: GowonContext,
    _params: UserGetWeeklyChartParams
  ): Promise<RawUserGetWeeklyAlbumChart> {
    return {} as any;
  }

  async _userGetWeeklyTrackChart(
    _ctx: GowonContext,
    _params: UserGetWeeklyChartParams
  ): Promise<RawUserGetWeeklyTrackChart> {
    return {} as any;
  }

  async love(_ctx: GowonContext, _params: TrackLoveParams): Promise<void> {}

  async unlove(_ctx: GowonContext, _params: TrackLoveParams): Promise<void> {}

  async getToken(_ctx: GowonContext): Promise<{ token: string }> {
    return { token: "" };
  }

  async _getSession(
    _ctx: GowonContext,
    _params: GetSessionParams
  ): Promise<RawLastFMSession> {
    return {} as any;
  }

  async scrobbleTrack(
    _ctx: GowonContext,
    _params: ScrobbleParams,
    _sk?: string
  ) {}
}
