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
  ConvertedAlbumInfo,
  ConvertedArtistInfo,
  ConvertedTagInfo,
  ConvertedTrackInfo,
  ConvertedUserInfo,
} from "./converters/InfoTypes";
import {
  ConvertedArtistCorrection,
  ConvertedArtistPopularTracks,
  ConvertedFriends,
  ConvertedTagTopArtists,
  ConvertedTagTopTracks,
  ConvertedTrackSearch,
} from "./converters/Misc";
import {
  ConvertedRecentTrack,
  ConvertedRecentTracks,
} from "./converters/RecentTracks";
import {
  ConvertedTopAlbums,
  ConvertedTopArtists,
  ConvertedTopTracks,
} from "./converters/TopTypes";

export class LastFMService extends LastFMAPIService {
  scraper = new LastFMScraper(this.logger);

  private tagsService = new TagsService(this, this.logger);

  async artistInfo(params: ArtistInfoParams): Promise<ConvertedArtistInfo> {
    let response: ConvertedArtistInfo;

    try {
      response = new ConvertedArtistInfo(await this._artistInfo(params));

      this.tagsService.cacheTagsFromArtistInfo(response);
    } catch (e) {
      if (e.name === "LastFMError:6")
        await this.tagsService.cacheTagsForArtistNotFound(params.artist);

      throw e;
    }

    return response;
  }

  async albumInfo(params: AlbumInfoParams): Promise<ConvertedAlbumInfo> {
    return new ConvertedAlbumInfo(await this._albumInfo(params));
  }

  async trackInfo(params: TrackInfoParams): Promise<ConvertedTrackInfo> {
    return new ConvertedTrackInfo(await this._trackInfo(params));
  }

  async userInfo(params: UserInfoParams): Promise<ConvertedUserInfo> {
    return new ConvertedUserInfo(await this._userInfo(params));
  }

  async tagInfo(params: TagInfoParams): Promise<ConvertedTagInfo> {
    return new ConvertedTagInfo(await this._tagInfo(params));
  }

  async topArtists(params: TopArtistsParams): Promise<ConvertedTopArtists> {
    return new ConvertedTopArtists(await this._topArtists(params));
  }

  async topAlbums(params: TopAlbumsParams): Promise<ConvertedTopAlbums> {
    return new ConvertedTopAlbums(await this._topAlbums(params));
  }

  async topTracks(params: TopTracksParams): Promise<ConvertedTopTracks> {
    return new ConvertedTopTracks(await this._topTracks(params));
  }

  async recentTracks(
    params: RecentTracksParams
  ): Promise<ConvertedRecentTracks> {
    return new ConvertedRecentTracks(await this._recentTracks(params));
  }

  async artistPopularTracks(
    params: ArtistPopularTracksParams
  ): Promise<ConvertedArtistPopularTracks> {
    return new ConvertedArtistPopularTracks(
      await this._artistPopularTracks(params)
    );
  }

  async tagTopArtists(
    params: TagTopArtistsParams
  ): Promise<ConvertedTagTopArtists> {
    return new ConvertedTagTopArtists(await this._tagTopArtists(params));
  }

  async trackSearch(params: TrackSearchParams): Promise<ConvertedTrackSearch> {
    return new ConvertedTrackSearch(await this._trackSearch(params));
  }

  async getArtistCorrection(
    params: GetArtistCorrectionParams
  ): Promise<ConvertedArtistCorrection> {
    return new ConvertedArtistCorrection(
      await this._getArtistCorrection(params)
    );
  }

  async userGetFriends(
    params: UserGetFriendsParams
  ): Promise<ConvertedFriends> {
    return new ConvertedFriends(await this._userGetFriends(params));
  }

  async tagTopTracks(
    params: TagTopTracksParams
  ): Promise<ConvertedTagTopTracks> {
    return new ConvertedTagTopTracks(await this._tagTopTracks(params));
  }

  // Derived methods
  async nowPlaying(username: string): Promise<ConvertedRecentTrack> {
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
  ): Promise<ConvertedRecentTrack> {
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

  async goBack(username: string, when: Date): Promise<ConvertedRecentTrack> {
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
