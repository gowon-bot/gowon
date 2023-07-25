import { differenceInDays } from "date-fns";
import gql from "graphql-tag";
import { log } from "mathjs";
import { CrownRankResponse } from "../../database/entity/Crown";
import { LogicError } from "../../errors/errors";
import { ago } from "../../helpers";
import { toInt } from "../../helpers/native/number";
import { calculatePercent } from "../../helpers/stats";
import { Requestable } from "../../services/LastFM/LastFMAPIService";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { LastFMPeriod } from "../../services/LastFM/LastFMService.types";
import { UserInfo } from "../../services/LastFM/converters/InfoTypes";
import {
  TopAlbums,
  TopArtists,
  TopTracks,
} from "../../services/LastFM/converters/TopTypes";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { CrownsService } from "../../services/dbservices/crowns/CrownsService";
import { MirrorballService } from "../../services/mirrorball/MirrorballService";
import { MirrorballPageInfo } from "../../services/mirrorball/MirrorballTypes";
import { GowonContext } from "../context/Context";
import { DateRange } from "../timeAndDate/DateRange";
import { displayDate, displayNumber } from "../views/displays";

export class Stat {
  public asString: string;

  constructor(public asNumber: number, asString?: string) {
    if (!asString) this.asString = displayNumber(asNumber);
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
    scrobbleCount?: number;
  } = {};

  private lastFMService = ServiceRegistry.get(LastFMService);
  private crownsService = ServiceRegistry.get(CrownsService);
  private mirrorballService = ServiceRegistry.get(MirrorballService);

  constructor(
    private ctx: GowonContext,
    private requestable: Requestable,
    private discordID: string | undefined,
    private userID: number,
    private timePeriod: LastFMPeriod | undefined
  ) {}

  async hasCrownStats(): Promise<boolean> {
    return !!this.userID && !!this.discordID && !!(await this.crownsCount());
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

  async scrobbleCount(): Promise<number> {
    if (!this.cache.scrobbleCount) {
      const dateRange = DateRange.fromPeriod(this.timePeriod, {
        fallback: "overall",
      });

      this.cache.scrobbleCount = await this.lastFMService.getNumberScrobbles(
        this.ctx,
        this.requestable,
        dateRange?.from,
        dateRange?.to
      );
    }

    return this.cache.scrobbleCount;
  }

  async userInfo(): Promise<UserInfo> {
    if (!this.cache.userInfo)
      this.cache.userInfo = await this.lastFMService.userInfo(this.ctx, {
        username: this.requestable,
      });

    return this.cache.userInfo;
  }

  async topArtists(): Promise<TopArtists> {
    if (!this.cache.topArtists)
      this.cache.topArtists = await this.lastFMService.topArtists(this.ctx, {
        username: this.requestable,
        limit: 1000,
        period: this.timePeriod,
      });

    return this.cache.topArtists;
  }

  async topAlbums(): Promise<TopAlbums> {
    if (!this.cache.topAlbums)
      this.cache.topAlbums = await this.lastFMService.topAlbums(this.ctx, {
        username: this.requestable,
        limit: 1,
        period: this.timePeriod,
      });

    return this.cache.topAlbums;
  }

  async topTracks(): Promise<TopTracks> {
    if (!this.cache.topTracks)
      this.cache.topTracks = await this.lastFMService.topTracks(this.ctx, {
        username: this.requestable,
        limit: 1,
        period: this.timePeriod,
      });

    return this.cache.topTracks;
  }

  async crownsCount(): Promise<number | undefined> {
    if (!this.discordID) return undefined;
    if (!this.cache.crownsCount)
      this.cache.crownsCount = toInt((await this.crownsRank())?.count);

    return this.cache.crownsCount;
  }

  async crownsRank(): Promise<CrownRankResponse | undefined> {
    if (!this.discordID) return undefined;
    if (!this.cache.crownsRank)
      this.cache.crownsRank = await this.crownsService.getRank(
        this.ctx,
        this.userID
      );

    return this.cache.crownsRank;
  }

  async joined(): Promise<string> {
    return `${displayDate((await this.userInfo()).registeredAt)} (${ago(
      (await this.userInfo()).registeredAt
    )})`;
  }

  async country(): Promise<string> {
    return (await this.userInfo()).country;
  }

  async totalScrobbles(): Promise<Stat> {
    const scrobbleCount = await this.scrobbleCount();

    return new Stat(scrobbleCount, displayNumber(scrobbleCount));
  }

  async avgPerDay(): Promise<Stat> {
    const [userInfo, scrobbleCount] = await Promise.all([
      this.userInfo(),
      this.scrobbleCount(),
    ]);

    const beginDate =
      DateRange.fromPeriod(this.timePeriod, {
        fallback: "overall",
      })?.from || userInfo.registeredAt;

    const diff = Math.abs(differenceInDays(beginDate, new Date()));

    return new Stat(scrobbleCount / diff, (scrobbleCount / diff).toFixed(0));
  }

  async totalArtists(): Promise<Stat> {
    const topArtists = await this.topArtists();

    return new Stat(
      topArtists.meta.total,
      displayNumber(topArtists.meta.total)
    );
  }

  async avgScrobblesPerArtist(): Promise<Stat> {
    const [scrobbleCount, topArtists] = await Promise.all([
      this.scrobbleCount(),
      this.topArtists(),
    ]);

    const average = ~~(scrobbleCount / topArtists.meta.total);

    return new Stat(average, average.toFixed(0));
  }

  async totalAlbums(): Promise<Stat> {
    const topAlbums = await this.topAlbums();

    return new Stat(topAlbums.meta.total, displayNumber(topAlbums.meta.total));
  }

  async avgScrobblesPerAlbum(): Promise<Stat> {
    const [scrobbleCount, topAlbums] = await Promise.all([
      this.scrobbleCount(),
      this.topAlbums(),
    ]);

    let average = ~~(scrobbleCount / topAlbums.meta.total);

    return new Stat(average, average.toFixed(0));
  }

  async totalTracks(): Promise<Stat> {
    const topTracks = await this.topTracks();

    return new Stat(topTracks.meta.total, displayNumber(topTracks.meta.total));
  }

  async avgScrobblesPerTrack(): Promise<Stat> {
    const [scrobbleCount, topTracks] = await Promise.all([
      this.scrobbleCount(),
      this.topTracks(),
    ]);

    const average = ~~(scrobbleCount / topTracks.meta.total);

    return new Stat(average, average.toFixed(0));
  }

  async albumsPerArtist(): Promise<Stat> {
    const [topArtists, topAlbums] = await Promise.all([
      this.topArtists(),
      this.topAlbums(),
    ]);

    let apa = topAlbums.meta.total / topArtists.meta.total;

    apa = apa === Infinity ? 0 : apa;

    return new Stat(apa, apa.toFixed(2));
  }

  async tracksPerArtist(): Promise<Stat> {
    const [topArtists, topTracks] = await Promise.all([
      this.topArtists(),
      this.topTracks(),
    ]);

    let tpa = topTracks.meta.total / topArtists.meta.total;

    tpa = tpa === Infinity ? 0 : tpa;

    return new Stat(tpa, tpa.toFixed(2));
  }

  async tracksPerAlbum(): Promise<Stat> {
    const [topAlbums, topTracks] = await Promise.all([
      this.topAlbums(),
      this.topTracks(),
    ]);

    let tpl = topTracks.meta.total / topAlbums.meta.total;

    tpl = tpl === Infinity ? 0 : tpl;

    return new Stat(tpl, tpl.toFixed(2));
  }

  async hIndex(): Promise<Stat> {
    const topArtists = await this.topArtists();

    for (
      let artistIndex = 0;
      artistIndex < topArtists.artists.length;
      artistIndex++
    ) {
      const artist = topArtists.artists[artistIndex];

      if (artist.userPlaycount <= artistIndex) {
        return new Stat(artistIndex || 1, (artistIndex || 1).toLocaleString());
      }
    }
    return new Stat(1, "1");
  }

  async topPercent(percent: number): Promise<{
    count: Stat;
    total: Stat;
  }> {
    const [topArtists, scrobbleCount] = await Promise.all([
      this.topArtists(),
      this.scrobbleCount(),
    ]);

    const halfOfScrobbles = scrobbleCount * (percent / 100);
    let sum = 0;

    for (
      let artistIndex = 0;
      artistIndex < topArtists.artists.length;
      artistIndex++
    ) {
      const artist = topArtists.artists[artistIndex];

      sum += artist.userPlaycount;

      if (sum > halfOfScrobbles) {
        const count = artistIndex + 1 || 1;
        return {
          count: new Stat(count, count.toLocaleString()),
          total: new Stat(sum, sum.toLocaleString()),
        };
      }
    }

    return {
      count: new Stat(
        topArtists.artists.length,
        topArtists.artists.length === 1000
          ? "1000+"
          : `${topArtists.artists.length}`
      ),
      total: new Stat(sum, sum.toLocaleString()),
    };
  }

  async sumTop(number = 10): Promise<Stat> {
    const sumTop = (await this.topArtists()).artists
      .slice(0, number)
      .reduce((sum, artist) => sum + artist.userPlaycount, 0);

    return new Stat(sumTop, sumTop.toLocaleString());
  }

  async sumTopPercent(number = 10): Promise<Stat> {
    const scrobbleCount = await this.scrobbleCount();
    const topArtists = (await this.topArtists()).artists
      .slice(0, number)
      .reduce((sum, artist) => sum + artist.userPlaycount, 0);

    return new Stat(
      topArtists / scrobbleCount,
      calculatePercent(topArtists, scrobbleCount)
    );
  }

  async tierPlaysOver(
    tiers: number[],
    take: number
  ): Promise<{ count: number; tier: number }[]> {
    const tierCounts = tiers
      .sort((a, b) => b - a)
      .map((t) => ({ tier: t, count: 0 }));

    for (const topArtist of (await this.topArtists()).artists) {
      tierCounts.forEach((tierCount) => {
        if (toInt(topArtist.userPlaycount) >= tierCount.tier) {
          tierCount.count++;
        }
      });
    }

    const sortedTiers = tierCounts.filter((t) => t.count > 0);

    return sortedTiers
      .reduce((acc, val) => {
        if (acc.length && acc[acc.length - 1]) {
          if (val.count === acc[acc.length - 1].count) {
            return acc;
          }
        }

        acc.push(val);

        return acc;
      }, [] as { count: number; tier: number }[])
      .slice(0, take);
  }

  async playsOver(number: number): Promise<Stat> {
    const po = (await this.topArtists()).artists.filter(
      (a) => a.userPlaycount >= number
    ).length;

    return new Stat(po, po.toLocaleString());
  }

  async artistsPerCrown(): Promise<Stat | undefined> {
    if (!this.discordID) return undefined;
    const [crownsCount, playsOver] = await Promise.all([
      this.crownsCount(),
      this.playsOver(30),
    ]);

    return new Stat(
      playsOver.asNumber / crownsCount!,
      (playsOver.asNumber / crownsCount!).toLocaleString()
    );
  }

  async scrobblesPerCrown(): Promise<Stat | undefined> {
    if (!this.discordID) return undefined;
    const [crownsCount, scrobbleCount] = await Promise.all([
      this.crownsCount(),
      this.scrobbleCount(),
    ]);

    return new Stat(
      scrobbleCount / crownsCount!,
      (scrobbleCount / crownsCount!).toFixed(2)
    );
  }

  async breadth(): Promise<{ rating: number; ratingString: string }> {
    const top50 = (await this.topPercent(50)).count.asNumber;
    const hindex = (await this.hIndex()).asNumber;
    const scrobbles = (await this.totalScrobbles()).asNumber;
    const sumTop = (await this.sumTop()).asNumber;

    if (scrobbles < 1000)
      throw new LogicError(
        "at least 1000 scrobbles are needed to calculate breadth"
      );

    const rating = log((top50 * Math.pow(hindex, 1.5)) / sumTop + 1, 2) * 5;

    const ratingString =
      rating.toFixed(1) === "6.9"
        ? "nice"
        : rating > 40
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
    const query = gql`
      query tags($artists: [ArtistInput!]!) {
        tags(settings: { artists: $artists }, requireTagsForMissing: true) {
          pageInfo {
            recordCount
          }
        }
      }
    `;

    const artists = topArtists.artists.map((a) => ({ name: a.name }));

    const response = await this.mirrorballService.query<{
      tags: { pageInfo: MirrorballPageInfo };
    }>(this.ctx, query, { artists });

    return new Stat(response.tags.pageInfo.recordCount);
  }
}
