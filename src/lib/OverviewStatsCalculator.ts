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

export class OverviewStatsCalculator {
  private username: string;
  private userID: string;
  private serverID: string;

  private cache: {
    userInfo?: UserInfo;
    topArtists?: TopArtists;
    topAlbums?: TopAlbums;
    topTracks?: TopTracks;
    crownsCount?: number;
  } = {};

  private lastFMService: LastFMService;
  private crownsService: CrownsService;

  constructor(
    username: string,
    userID: string,
    serverID: string,
    logger?: Logger
  ) {
    this.username = username;
    this.userID = userID;
    this.serverID = serverID;
    this.lastFMService = new LastFMService(logger);
    this.crownsService = new CrownsService(logger);
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

  async crownsCount(): Promise<number> {
    if (!this.cache.crownsCount)
      this.cache.crownsCount = await this.crownsService.count(
        this.userID,
        this.serverID
      );

    return this.cache.crownsCount;
  }

  async joined(): Promise<string> {
    return moment
      .unix(parseInt((await this.userInfo()).registered.unixtime, 10))
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

    let scrobbles = parseInt(userInfo.playcount, 10);
    let diff = Math.abs(
      moment
        .unix(parseInt(userInfo.registered.unixtime, 10))
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
      parseInt(userInfo.playcount, 10) / parseInt(topArtists["@attr"].total, 10)
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
      parseInt(userInfo.playcount, 10) / parseInt(topAlbums["@attr"].total, 10)
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
      parseInt(userInfo.playcount, 10) / parseInt(topTracks["@attr"].total, 10)
    ).toFixed(2);
  }

  async albumsPerArtist(): Promise<string> {
    let [topArtists, topAlbums] = await Promise.all([
      this.topArtists(),
      this.topAlbums(),
    ]);

    return (
      parseInt(topAlbums["@attr"].total, 10) /
      parseInt(topArtists["@attr"].total, 10)
    ).toFixed(2);
  }

  async tracksPerArtist(): Promise<string> {
    let [topArtists, topTracks] = await Promise.all([
      this.topArtists(),
      this.topTracks(),
    ]);

    return (
      parseInt(topTracks["@attr"].total, 10) /
      parseInt(topArtists["@attr"].total, 10)
    ).toFixed(2);
  }

  async tracksPerAlbum(): Promise<string> {
    let [topAlbums, topTracks] = await Promise.all([
      this.topAlbums(),
      this.topTracks(),
    ]);

    return (
      parseInt(topTracks["@attr"].total, 10) /
      parseInt(topAlbums["@attr"].total, 10)
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

      if (parseInt(artist.playcount, 10) <= artistIndex) {
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

    let halfOfScrobbles = parseInt(userInfo.playcount, 10) / 2;
    let sum = 0;

    for (
      let artistIndex = 0;
      artistIndex < topArtists.artist.length;
      artistIndex++
    ) {
      const artist = topArtists.artist[artistIndex];

      sum += parseInt(artist.playcount, 10);

      if (sum > halfOfScrobbles) {
        return artistIndex.toLocaleString();
      }
    }
    return "0";
  }

  async sumTop(number = 10) {
    return (await this.topArtists()).artist
      .slice(0, number)
      .reduce((sum, artist) => sum + parseInt(artist.playcount, 10), 0);
  }

  async sumTopPercent(number = 10) {
    let totalScrobbles = parseInt((await this.userInfo()).playcount, 10);

    return calculatePercent(
      (await this.topArtists()).artist
        .slice(0, number)
        .reduce((sum, artist) => sum + parseInt(artist.playcount, 10), 0),
      totalScrobbles
    );
  }

  async playsOver(number: number): Promise<string> {
    return (await this.topArtists()).artist
      .filter((a) => parseInt(a.playcount, 10) > number)
      .length.toLocaleString();
  }

  async totalCrowns(): Promise<string> {
    return (await this.crownsCount()).toFixed();
  }

  async artistsPerCrown(): Promise<string> {
    let [crownsCount, playsOver] = await Promise.all([
      this.crownsCount(),
      this.playsOver(30),
    ]);

    return (parseInt(playsOver, 10) / crownsCount).toFixed(2);
  }

  async scrobblesPerCrown(): Promise<string> {
    let [crownsCount, userInfo] = await Promise.all([
      this.crownsCount(),
      this.userInfo(),
    ]);

    return (parseInt(userInfo.playcount, 10) / crownsCount).toFixed(2);
  }
}