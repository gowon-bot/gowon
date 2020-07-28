import {
  UserInfo,
  TopArtists,
  TopAlbums,
  TopTracks,
} from "../services/LastFMService.types";
import { LastFMService } from "../services/LastFMService";
import moment from "moment";
import { CrownsService } from "../services/dbservices/CrownsService";
import { Logger } from "./Logger";
import { numberDisplay } from "../helpers";
import { calculatePercent } from "../helpers/stats";
import { CrownRankResponse } from "../database/entity/Crown";

export class OverviewStatsCalculator {
  private username: string;
  private userID?: string;
  private serverID: string;

  private cache: {
    userInfo?: UserInfo;
    topArtists?: TopArtists;
    topAlbums?: TopAlbums;
    topTracks?: TopTracks;
    crownsRank?: CrownRankResponse;
    crownsCount?: number;
  } = {};

  private lastFMService: LastFMService;
  private crownsService: CrownsService;

  constructor(
    username: string,
    serverID: string,
    userID?: string,
    logger?: Logger
  ) {
    this.username = username;
    this.userID = userID;
    this.serverID = serverID;
    this.lastFMService = new LastFMService(logger);
    this.crownsService = new CrownsService(logger);
  }

  hasCrownStats(): boolean {
    return !!this.userID
  }

  async cacheAll(): Promise<void> {
    await Promise.all([
      this.userInfo(),
      this.topArtists(),
      this.topAlbums(),
      this.topTracks(),
      this.crownsCount(),
    ]);
  }

  async userInfo(): Promise<UserInfo> {
    if (!this.cache.userInfo)
      this.cache.userInfo = await this.lastFMService.userInfo(this.username);

    return this.cache.userInfo;
  }

  async topArtists(): Promise<TopArtists> {
    if (!this.cache.topArtists)
      this.cache.topArtists = await this.lastFMService.topArtists(
        this.username,
        1000
      );

    return this.cache.topArtists;
  }

  async topAlbums(): Promise<TopAlbums> {
    if (!this.cache.topAlbums)
      this.cache.topAlbums = await this.lastFMService.topAlbums(
        this.username,
        1
      );

    return this.cache.topAlbums;
  }

  async topTracks(): Promise<TopTracks> {
    if (!this.cache.topTracks)
      this.cache.topTracks = await this.lastFMService.topTracks(
        this.username,
        1
      );

    return this.cache.topTracks;
  }

  async crownsCount(): Promise<number | undefined> {
    if (!this.userID) return undefined;
    if (!this.cache.crownsCount)
      this.cache.crownsCount = (await this.crownsRank())!.count.toInt();

    return this.cache.crownsCount;
  }

  async crownsRank(): Promise<CrownRankResponse | undefined> {
    if (!this.userID) return undefined;
    if (!this.cache.crownsRank)
      this.cache.crownsRank = await this.crownsService.getRank(
        this.userID,
        this.serverID
      );

    return this.cache.crownsRank;
  }

  async joined(): Promise<string> {
    return moment
      .unix((await this.userInfo()).registered.unixtime.toInt())
      .format("MMMM Do, YYYY");
  }

  async country(): Promise<string> {
    return (await this.userInfo()).country;
  }

  async totalScrobbles(): Promise<string> {
    let userInfo = await this.userInfo();

    return numberDisplay(userInfo.playcount);
  }

  async avgPerDay(): Promise<string> {
    let userInfo = await this.userInfo();

    let scrobbles = userInfo.playcount.toInt();
    let diff = Math.abs(
      moment
        .unix(userInfo.registered.unixtime.toInt())
        .startOf("day")
        .diff(moment().startOf("day"), "days")
    );

    return (scrobbles / diff).toFixed(2);
  }

  async totalArtists(): Promise<string> {
    let topArtists = await this.topArtists();

    return topArtists["@attr"].total;
  }

  async avgScrobblesPerArtist(): Promise<string> {
    let [userInfo, topArtists] = await Promise.all([
      this.userInfo(),
      this.topArtists(),
    ]);

    return (
      userInfo.playcount.toInt() / topArtists["@attr"].total.toInt()
    ).toFixed(2);
  }

  async totalAlbums(): Promise<string> {
    let topAlbums = await this.topAlbums();

    return topAlbums["@attr"].total;
  }

  async avgScrobblesPerAlbum(): Promise<string> {
    let [userInfo, topAlbums] = await Promise.all([
      this.userInfo(),
      this.topAlbums(),
    ]);

    return (
      userInfo.playcount.toInt() / topAlbums["@attr"].total.toInt()
    ).toFixed(2);
  }

  async totalTracks(): Promise<string> {
    let topTracks = await this.topTracks();

    return topTracks["@attr"].total;
  }

  async avgScrobblesPerTrack(): Promise<string> {
    let [userInfo, topTracks] = await Promise.all([
      this.userInfo(),
      this.topTracks(),
    ]);

    return (
      userInfo.playcount.toInt() / topTracks["@attr"].total.toInt()
    ).toFixed(2);
  }

  async albumsPerArtist(): Promise<string> {
    let [topArtists, topAlbums] = await Promise.all([
      this.topArtists(),
      this.topAlbums(),
    ]);

    return (
      topAlbums["@attr"].total.toInt() / topArtists["@attr"].total.toInt()
    ).toFixed(2);
  }

  async tracksPerArtist(): Promise<string> {
    let [topArtists, topTracks] = await Promise.all([
      this.topArtists(),
      this.topTracks(),
    ]);

    return (
      topTracks["@attr"].total.toInt() / topArtists["@attr"].total.toInt()
    ).toFixed(2);
  }

  async tracksPerAlbum(): Promise<string> {
    let [topAlbums, topTracks] = await Promise.all([
      this.topAlbums(),
      this.topTracks(),
    ]);

    return (
      topTracks["@attr"].total.toInt() / topAlbums["@attr"].total.toInt()
    ).toFixed(2);
  }

  async hIndex(): Promise<string> {
    let topArtists = await this.topArtists();

    for (
      let artistIndex = 0;
      artistIndex < topArtists.artist.length;
      artistIndex++
    ) {
      const artist = topArtists.artist[artistIndex];

      if (artist.playcount.toInt() <= artistIndex) {
        return artistIndex.toLocaleString();
      }
    }
    return "";
  }

  async top50Percent(): Promise<string> {
    let [topArtists, userInfo] = await Promise.all([
      this.topArtists(),
      this.userInfo(),
    ]);

    let halfOfScrobbles = userInfo.playcount.toInt() / 2;
    let sum = 0;

    for (
      let artistIndex = 0;
      artistIndex < topArtists.artist.length;
      artistIndex++
    ) {
      const artist = topArtists.artist[artistIndex];

      sum += artist.playcount.toInt();

      if (sum > halfOfScrobbles) {
        return artistIndex.toLocaleString();
      }
    }
    return "0";
  }

  async sumTop(number = 10) {
    return (await this.topArtists()).artist
      .slice(0, number)
      .reduce((sum, artist) => sum + artist.playcount.toInt(), 0);
  }

  async sumTopPercent(number = 10) {
    let totalScrobbles = (await this.userInfo()).playcount.toInt();

    return calculatePercent(
      (await this.topArtists()).artist
        .slice(0, number)
        .reduce((sum, artist) => sum + artist.playcount.toInt(), 0),
      totalScrobbles
    );
  }

  async playsOver(number: number): Promise<string> {
    return (await this.topArtists()).artist
      .filter((a) => a.playcount.toInt() > number)
      .length.toLocaleString();
  }

  async artistsPerCrown(): Promise<string | undefined> {
    if (!this.userID) return undefined;
    let [crownsCount, playsOver] = await Promise.all([
      this.crownsCount(),
      this.playsOver(30),
    ]);

    return (playsOver.toInt() / crownsCount!).toFixed(2);
  }

  async scrobblesPerCrown(): Promise<string | undefined> {
    if (!this.userID) return undefined;
    let [crownsCount, userInfo] = await Promise.all([
      this.crownsCount(),
      this.userInfo(),
    ]);

    return (userInfo.playcount.toInt() / crownsCount!).toFixed(2);
  }
}
