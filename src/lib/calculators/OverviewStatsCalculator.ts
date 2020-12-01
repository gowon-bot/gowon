import {
  UserInfo,
  TopArtists,
  TopAlbums,
  TopTracks,
} from "../../services/LastFM/LastFMService.types";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { CrownsService } from "../../services/dbservices/CrownsService";
import { Logger } from "../Logger";
import { dateDisplay, numberDisplay } from "../../helpers";
import { calculatePercent } from "../../helpers/stats";
import { CrownRankResponse } from "../../database/entity/Crown";
import { log } from "mathjs";
import { LogicError } from "../../errors";
import { differenceInDays, fromUnixTime } from "date-fns";

export class Stat {
  constructor(public asNumber: number, public asString: string) {}

  toString(): string {
    return this.asString;
  }
}

export class OverviewStatsCalculator {
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
    private username: string,
    private serverID: string,
    private userID?: string,
    logger?: Logger
  ) {
    this.lastFMService = new LastFMService(logger);
    this.crownsService = new CrownsService(logger);
  }

  async hasCrownStats(): Promise<boolean> {
    return !!this.userID && !!(await this.crownsCount());
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
      this.cache.userInfo = await this.lastFMService.userInfo({
        username: this.username,
      });

    return this.cache.userInfo;
  }

  async topArtists(): Promise<TopArtists> {
    if (!this.cache.topArtists)
      this.cache.topArtists = await this.lastFMService.topArtists({
        username: this.username,
        limit: 1000,
      });

    return this.cache.topArtists;
  }

  async topAlbums(): Promise<TopAlbums> {
    if (!this.cache.topAlbums)
      this.cache.topAlbums = await this.lastFMService.topAlbums({
        username: this.username,
        limit: 1,
      });

    return this.cache.topAlbums;
  }

  async topTracks(): Promise<TopTracks> {
    if (!this.cache.topTracks)
      this.cache.topTracks = await this.lastFMService.topTracks({
        username: this.username,
        limit: 1,
      });

    return this.cache.topTracks;
  }

  async crownsCount(): Promise<number | undefined> {
    if (!this.userID) return undefined;
    if (!this.cache.crownsCount)
      this.cache.crownsCount = (await this.crownsRank())?.count?.toInt();

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
    return dateDisplay(
      fromUnixTime((await this.userInfo()).registered.unixtime.toInt())
    );
  }

  async country(): Promise<string> {
    return (await this.userInfo()).country;
  }

  async totalScrobbles(): Promise<Stat> {
    let userInfo = await this.userInfo();

    return new Stat(
      userInfo.playcount.toInt(),
      numberDisplay(userInfo.playcount)
    );
  }

  async avgPerDay(): Promise<Stat> {
    let userInfo = await this.userInfo();

    let scrobbles = userInfo.playcount.toInt();

    let diff = Math.abs(
      differenceInDays(
        fromUnixTime(userInfo.registered.unixtime.toInt()),
        new Date()
      )
    );

    return new Stat(scrobbles / diff, (scrobbles / diff).toFixed(0));
  }

  async totalArtists(): Promise<Stat> {
    let topArtists = await this.topArtists();

    return new Stat(
      topArtists["@attr"].total.toInt(),
      numberDisplay(topArtists["@attr"].total)
    );
  }

  async avgScrobblesPerArtist(): Promise<Stat> {
    let [userInfo, topArtists] = await Promise.all([
      this.userInfo(),
      this.topArtists(),
    ]);

    let average = ~~(
      userInfo.playcount.toInt() / topArtists["@attr"].total.toInt()
    );

    return new Stat(average, average.toFixed(0));
  }

  async totalAlbums(): Promise<Stat> {
    let topAlbums = await this.topAlbums();

    return new Stat(
      topAlbums["@attr"].total.toInt(),
      numberDisplay(topAlbums["@attr"].total)
    );
  }

  async avgScrobblesPerAlbum(): Promise<Stat> {
    let [userInfo, topAlbums] = await Promise.all([
      this.userInfo(),
      this.topAlbums(),
    ]);

    let average = ~~(
      userInfo.playcount.toInt() / topAlbums["@attr"].total.toInt()
    );

    return new Stat(average, average.toFixed(0));
  }

  async totalTracks(): Promise<Stat> {
    let topTracks = await this.topTracks();

    return new Stat(
      topTracks["@attr"].total.toInt(),
      numberDisplay(topTracks["@attr"].total)
    );
  }

  async avgScrobblesPerTrack(): Promise<Stat> {
    let [userInfo, topTracks] = await Promise.all([
      this.userInfo(),
      this.topTracks(),
    ]);

    let average = ~~(
      userInfo.playcount.toInt() / topTracks["@attr"].total.toInt()
    );

    return new Stat(average, average.toFixed(0));
  }

  async albumsPerArtist(): Promise<Stat> {
    let [topArtists, topAlbums] = await Promise.all([
      this.topArtists(),
      this.topAlbums(),
    ]);

    let apa =
      topAlbums["@attr"].total.toInt() / topArtists["@attr"].total.toInt();

    apa = apa === Infinity ? 0 : apa;

    return new Stat(apa, apa.toFixed(2));
  }

  async tracksPerArtist(): Promise<Stat> {
    let [topArtists, topTracks] = await Promise.all([
      this.topArtists(),
      this.topTracks(),
    ]);

    let tpa =
      topTracks["@attr"].total.toInt() / topArtists["@attr"].total.toInt();

    tpa = tpa === Infinity ? 0 : tpa;

    return new Stat(tpa, tpa.toFixed(2));
  }

  async tracksPerAlbum(): Promise<Stat> {
    let [topAlbums, topTracks] = await Promise.all([
      this.topAlbums(),
      this.topTracks(),
    ]);

    let tpl =
      topTracks["@attr"].total.toInt() / topAlbums["@attr"].total.toInt();

    tpl = tpl === Infinity ? 0 : tpl;

    return new Stat(tpl, tpl.toFixed(2));
  }

  async hIndex(): Promise<Stat> {
    let topArtists = await this.topArtists();

    for (
      let artistIndex = 0;
      artistIndex < topArtists.artist.length;
      artistIndex++
    ) {
      const artist = topArtists.artist[artistIndex];

      if (artist.playcount.toInt() <= artistIndex) {
        return new Stat(artistIndex || 1, (artistIndex || 1).toLocaleString());
      }
    }
    return new Stat(1, "1");
  }

  async topPercent(
    percent: number
  ): Promise<{
    count: Stat;
    total: Stat;
  }> {
    let [topArtists, userInfo] = await Promise.all([
      this.topArtists(),
      this.userInfo(),
    ]);

    let halfOfScrobbles = userInfo.playcount.toInt() * (percent / 100);
    let sum = 0;

    for (
      let artistIndex = 0;
      artistIndex < topArtists.artist.length;
      artistIndex++
    ) {
      const artist = topArtists.artist[artistIndex];

      sum += artist.playcount.toInt();

      if (sum > halfOfScrobbles) {
        let count = artistIndex + 1 || 1;
        return {
          count: new Stat(count, count.toLocaleString()),
          total: new Stat(sum, sum.toLocaleString()),
        };
      }
    }

    return {
      count: new Stat(1000, "1000+"),
      total: new Stat(sum, sum.toLocaleString()),
    };
  }

  async sumTop(number = 10): Promise<Stat> {
    let sumTop = (await this.topArtists()).artist
      .slice(0, number)
      .reduce((sum, artist) => sum + artist.playcount.toInt(), 0);

    return new Stat(sumTop, sumTop.toLocaleString());
  }

  async sumTopPercent(number = 10): Promise<Stat> {
    let totalScrobbles = (await this.userInfo()).playcount.toInt();
    let topArtists = (await this.topArtists()).artist
      .slice(0, number)
      .reduce((sum, artist) => sum + artist.playcount.toInt(), 0);

    return new Stat(
      topArtists / totalScrobbles,
      calculatePercent(topArtists, totalScrobbles)
    );
  }

  async playsOver(number: number): Promise<Stat> {
    let po = (await this.topArtists()).artist.filter(
      (a) => a.playcount.toInt() >= number
    ).length;

    return new Stat(po, po.toLocaleString());
  }

  async artistsPerCrown(): Promise<Stat | undefined> {
    if (!this.userID) return undefined;
    let [crownsCount, playsOver] = await Promise.all([
      this.crownsCount(),
      this.playsOver(30),
    ]);

    return new Stat(
      playsOver.asNumber / crownsCount!,
      (playsOver.asNumber / crownsCount!).toLocaleString()
    );
  }

  async scrobblesPerCrown(): Promise<Stat | undefined> {
    if (!this.userID) return undefined;
    let [crownsCount, userInfo] = await Promise.all([
      this.crownsCount(),
      this.userInfo(),
    ]);

    return new Stat(
      userInfo.playcount.toInt() / crownsCount!,
      (userInfo.playcount.toInt() / crownsCount!).toFixed(2)
    );
  }

  async breadth(): Promise<{ rating: number; ratingString: string }> {
    let top50 = (await this.topPercent(50)).count.asNumber;
    let hindex = (await this.hIndex()).asNumber;
    let scrobbles = (await this.totalScrobbles()).asNumber;
    let sumTop = (await this.sumTop()).asNumber;

    if (scrobbles < 1000)
      throw new LogicError(
        "at least 1000 scrobbles are needed to calculate breadth"
      );

    let rating = log((top50 * Math.pow(hindex, 1.5)) / sumTop + 1, 2) * 5;

    let ratingString =
      rating > 40
        ? "what the fuck"
        : rating > 35
        ? "really high!"
        : rating > 30
        ? "very high"
        : rating > 20
        ? "high"
        : rating > 10
        ? "medium"
        : rating > 5
        ? "low"
        : rating > 1
        ? "very low"
        : ".... really?";

    return { rating, ratingString };
  }
}
