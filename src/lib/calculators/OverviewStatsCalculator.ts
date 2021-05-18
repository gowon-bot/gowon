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
import { TagsCache } from "../caches/TagsCache";
import { TagsService } from "../../services/dbservices/tags/TagsService";
import { toInt } from "../../helpers/lastFM";

export class Stat {
  public asString: string;

  constructor(public asNumber: number, asString?: string) {
    if (!asString) this.asString = numberDisplay(asNumber);
    else this.asString = asString;
  }

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
  private tagsCache: TagsCache;

  constructor(
    private username: string,
    private serverID: string,
    private userID?: string,
    logger?: Logger
  ) {
    this.lastFMService = new LastFMService(logger);
    this.crownsService = new CrownsService(logger);
    this.tagsCache = new TagsCache(
      new TagsService(this.lastFMService, logger),
      this.lastFMService
    );
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
      this.cache.crownsCount = toInt((await this.crownsRank())?.count);

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
      fromUnixTime(toInt((await this.userInfo()).registered.unixtime))
    );
  }

  async country(): Promise<string> {
    return (await this.userInfo()).country;
  }

  async totalScrobbles(): Promise<Stat> {
    let userInfo = await this.userInfo();

    return new Stat(
      toInt(userInfo.playcount),
      numberDisplay(userInfo.playcount)
    );
  }

  async avgPerDay(): Promise<Stat> {
    let userInfo = await this.userInfo();

    let scrobbles = toInt(userInfo.playcount);

    let diff = Math.abs(
      differenceInDays(
        fromUnixTime(toInt(userInfo.registered.unixtime)),
        new Date()
      )
    );

    return new Stat(scrobbles / diff, (scrobbles / diff).toFixed(0));
  }

  async totalArtists(): Promise<Stat> {
    let topArtists = await this.topArtists();

    return new Stat(
      toInt(topArtists["@attr"].total),
      numberDisplay(topArtists["@attr"].total)
    );
  }

  async avgScrobblesPerArtist(): Promise<Stat> {
    let [userInfo, topArtists] = await Promise.all([
      this.userInfo(),
      this.topArtists(),
    ]);

    let average = ~~(
      toInt(userInfo.playcount) / toInt(topArtists["@attr"].total)
    );

    return new Stat(average, average.toFixed(0));
  }

  async totalAlbums(): Promise<Stat> {
    let topAlbums = await this.topAlbums();

    return new Stat(
      toInt(topAlbums["@attr"].total),
      numberDisplay(topAlbums["@attr"].total)
    );
  }

  async avgScrobblesPerAlbum(): Promise<Stat> {
    let [userInfo, topAlbums] = await Promise.all([
      this.userInfo(),
      this.topAlbums(),
    ]);

    let average = ~~(
      toInt(userInfo.playcount) / toInt(topAlbums["@attr"].total)
    );

    return new Stat(average, average.toFixed(0));
  }

  async totalTracks(): Promise<Stat> {
    let topTracks = await this.topTracks();

    return new Stat(
      toInt(topTracks["@attr"].total),
      numberDisplay(topTracks["@attr"].total)
    );
  }

  async avgScrobblesPerTrack(): Promise<Stat> {
    let [userInfo, topTracks] = await Promise.all([
      this.userInfo(),
      this.topTracks(),
    ]);

    let average = ~~(
      toInt(userInfo.playcount) / toInt(topTracks["@attr"].total)
    );

    return new Stat(average, average.toFixed(0));
  }

  async albumsPerArtist(): Promise<Stat> {
    let [topArtists, topAlbums] = await Promise.all([
      this.topArtists(),
      this.topAlbums(),
    ]);

    let apa =
      toInt(topAlbums["@attr"].total) / toInt(topArtists["@attr"].total);

    apa = apa === Infinity ? 0 : apa;

    return new Stat(apa, apa.toFixed(2));
  }

  async tracksPerArtist(): Promise<Stat> {
    let [topArtists, topTracks] = await Promise.all([
      this.topArtists(),
      this.topTracks(),
    ]);

    let tpa =
      toInt(topTracks["@attr"].total) / toInt(topArtists["@attr"].total);

    tpa = tpa === Infinity ? 0 : tpa;

    return new Stat(tpa, tpa.toFixed(2));
  }

  async tracksPerAlbum(): Promise<Stat> {
    let [topAlbums, topTracks] = await Promise.all([
      this.topAlbums(),
      this.topTracks(),
    ]);

    let tpl = toInt(topTracks["@attr"].total) / toInt(topAlbums["@attr"].total);

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

      if (toInt(artist.playcount) <= artistIndex) {
        return new Stat(artistIndex || 1, (artistIndex || 1).toLocaleString());
      }
    }
    return new Stat(1, "1");
  }

  async topPercent(percent: number): Promise<{
    count: Stat;
    total: Stat;
  }> {
    let [topArtists, userInfo] = await Promise.all([
      this.topArtists(),
      this.userInfo(),
    ]);

    let halfOfScrobbles = toInt(userInfo.playcount) * (percent / 100);
    let sum = 0;

    for (
      let artistIndex = 0;
      artistIndex < topArtists.artist.length;
      artistIndex++
    ) {
      const artist = topArtists.artist[artistIndex];

      sum += toInt(artist.playcount);

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
      .reduce((sum, artist) => sum + toInt(artist.playcount), 0);

    return new Stat(sumTop, sumTop.toLocaleString());
  }

  async sumTopPercent(number = 10): Promise<Stat> {
    let totalScrobbles = toInt((await this.userInfo()).playcount);
    let topArtists = (await this.topArtists()).artist
      .slice(0, number)
      .reduce((sum, artist) => sum + toInt(artist.playcount), 0);

    return new Stat(
      topArtists / totalScrobbles,
      calculatePercent(topArtists, totalScrobbles)
    );
  }

  async tierPlaysOver(
    tiers: number[],
    take: number
  ): Promise<{ count: number; tier: number }[]> {
    const tierCounts = tiers
      .sort((a, b) => b - a)
      .map((t) => ({ tier: t, count: 0 }));

    for (let topArtist of (await this.topArtists()).artist) {
      tierCounts.forEach((tierCount) => {
        if (toInt(topArtist.playcount) >= tierCount.tier) {
          tierCount.count++;
        }
      });
    }

    return tierCounts.filter((t) => t.count > 0).slice(0, take);
  }

  async playsOver(number: number): Promise<Stat> {
    let po = (await this.topArtists()).artist.filter(
      (a) => toInt(a.playcount) >= number
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
      toInt(userInfo.playcount) / crownsCount!,
      (toInt(userInfo.playcount) / crownsCount!).toFixed(2)
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

  async uniqueTags(): Promise<Stat> {
    const topArtists = await this.topArtists();
    const tags = [];

    for (let artist of topArtists.artist) {
      tags.push(...(await this.tagsCache.getTags(artist.name)));
    }

    return new Stat([...new Set(tags)].length);
  }
}
