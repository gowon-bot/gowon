import { stringify } from "querystring";

import {
  Track,
  Params,
  RecentTracksParams,
  TrackInfoParams,
  ArtistInfoParams,
  AlbumInfoParams,
  LastFMPeriod,
} from "./LastFMService.types";
import config from "../../../config.json";
import { ParsedTrack, parseLastFMTrackResponse } from "../../helpers/lastFM";
import { LogicError, BadLastFMResponseError } from "../../errors";
import { numberDisplay } from "../../helpers";
import { LastFMScraper } from "../scrapingServices/LastFMScraper";
import { LastFMAPIService } from "./LastFMAPIService";
import { Logger } from "../../lib/Logger";
import { delay } from "bluebird";
import { add } from "date-fns";

export class LastFMService extends LastFMAPIService {
  url = "https://ws.audioscrobbler.com/2.0/";
  scraper = new LastFMScraper(this.logger);

  constructor(logger?: Logger) {
    super(logger);
  }

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

  async nowPlaying(username: string): Promise<Track> {
    return (
      await this.recentTracks({
        username,
        limit: 1,
      })
    ).track[0];
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
    let to = add(when, { hours: 6 });

    let params = {
      username,
      limit: 1,
      from: ~~(when.getTime() / 1000),
      to: ~~(to.getTime() / 1000),
    };

    let recentTracks = await this.recentTracks(params);

    return recentTracks.track[1] ?? recentTracks.track[0];
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

  async validateRedirect(from: string, to: string): Promise<boolean> {
    let fromCount = await this.getArtistPlays(
      config.lastFMVerificationUsername,
      from
    );

    await this.scrobbleTrack({
      artist: from,
      track: `${from} → ${to}`,
      timestamp: Math.ceil(new Date().getTime() / 1000),
    });

    await delay(5000);

    let toCount = await this.getArtistPlays(
      config.lastFMVerificationUsername,
      to
    );

    return toCount === fromCount + 1;
  }
}
