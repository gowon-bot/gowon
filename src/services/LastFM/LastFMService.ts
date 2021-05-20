import { add } from "date-fns";
import { BadLastFMResponseError, LogicError } from "../../errors";
import { numberDisplay } from "../../helpers";
import { TagsService } from "../dbservices/tags/TagsService";
import { LastFMScraper } from "../scrapingServices/LastFMScraper";
import { LastFMAPIService } from "./LastFMAPIService";
import {
  AlbumInfoParams,
  ArtistInfoParams,
  ArtistPopularTracksParams,
  GetArtistCorrectionParams,
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
  TagTopArtists,
  TagTopTracks,
  TrackSearch,
} from "./converters/Misc";
import { RecentTrack, RecentTracks } from "./converters/RecentTracks";
import { TopAlbums, TopArtists, TopTracks } from "./converters/TopTypes";

export class LastFMService extends LastFMAPIService {
  scraper = new LastFMScraper(this.logger);

  private tagsService = new TagsService(this, this.logger);

  async artistInfo(params: ArtistInfoParams): Promise<ArtistInfo> {
    let response: ArtistInfo;

    try {
      response = new ArtistInfo(await this._artistInfo(params));

      this.tagsService.cacheTagsFromArtistInfo(response);
    } catch (e) {
      if (e.name === "LastFMError:6")
        await this.tagsService.cacheTagsForArtistNotFound(params.artist);

      throw e;
    }

    return response;
  }

  async albumInfo(params: AlbumInfoParams): Promise<AlbumInfo> {
    return new AlbumInfo(await this._albumInfo(params));
  }

  async trackInfo(params: TrackInfoParams): Promise<TrackInfo> {
    return new TrackInfo(await this._trackInfo(params));
  }

  async userInfo(params: UserInfoParams): Promise<UserInfo> {
    return new UserInfo(await this._userInfo(params));
  }

  async tagInfo(params: TagInfoParams): Promise<TagInfo> {
    return new TagInfo(await this._tagInfo(params));
  }

  async topArtists(params: TopArtistsParams): Promise<TopArtists> {
    return new TopArtists(await this._topArtists(params));
  }

  async topAlbums(params: TopAlbumsParams): Promise<TopAlbums> {
    return new TopAlbums(await this._topAlbums(params));
  }

  async topTracks(params: TopTracksParams): Promise<TopTracks> {
    return new TopTracks(await this._topTracks(params));
  }

  async recentTracks(params: RecentTracksParams): Promise<RecentTracks> {
    return new RecentTracks(await this._recentTracks(params));
  }

  async artistPopularTracks(
    params: ArtistPopularTracksParams
  ): Promise<ArtistPopularTracks> {
    return new ArtistPopularTracks(await this._artistPopularTracks(params));
  }

  async tagTopArtists(params: TagTopArtistsParams): Promise<TagTopArtists> {
    return new TagTopArtists(await this._tagTopArtists(params));
  }

  async trackSearch(params: TrackSearchParams): Promise<TrackSearch> {
    return new TrackSearch(await this._trackSearch(params));
  }

  async getArtistCorrection(
    params: GetArtistCorrectionParams
  ): Promise<ArtistCorrection> {
    return new ArtistCorrection(await this._getArtistCorrection(params));
  }

  async userGetFriends(params: UserGetFriendsParams): Promise<Friends> {
    return new Friends(await this._userGetFriends(params));
  }

  async tagTopTracks(params: TagTopTracksParams): Promise<TagTopTracks> {
    return new TagTopTracks(await this._tagTopTracks(params));
  }

  // Derived methods
  async nowPlaying(username: string): Promise<RecentTrack> {
    return (await this.recentTracks({ limit: 1, username })).first();
  }

  async getArtistPlays(username: string, artist: string): Promise<number> {
    let playcount = (await this.artistInfo({ artist, username }))
      ?.userPlaycount;

    if (isNaN(playcount)) throw new BadLastFMResponseError();

    return playcount;
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

  async getArtistTags(artist: string): Promise<string[]> {
    try {
      return (await this.artistInfo({ artist }))?.tags || [];
    } catch {
      return [];
    }
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

    return topArtists.meta.total || 0;
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

    return topArtists.meta.total || 0;
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

    return topTracks.meta.total || 0;
  }

  async getMilestone(
    username: string,
    milestone: number
  ): Promise<RecentTrack> {
    let total = (await this.recentTracks({ username, limit: 1 })).meta.total;

    let response = await this.recentTracks({
      username,
      page: total - milestone + 1,
      limit: 1,
    });

    if (milestone > response.meta.total) {
      throw new LogicError(
        `${username} hasn't scrobbled ${numberDisplay(milestone, "track")} yet!`
      );
    }

    return response.tracks[1] ?? response.first();
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

    return recentTracks.meta.total || 0;
  }

  async goBack(username: string, when: Date): Promise<RecentTrack> {
    let to = add(when, { hours: 6 });

    let params = {
      username,
      limit: 1,
      from: ~~(when.getTime() / 1000),
      to: ~~(to.getTime() / 1000),
    };

    let recentTracks = await this.recentTracks(params);

    return recentTracks.tracks[1] ?? recentTracks.first();
  }
}
