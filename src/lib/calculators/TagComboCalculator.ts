import { TagsService } from "../../services/dbservices/TagsService";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { RecentTracks, Track } from "../../services/LastFM/LastFMService.types";
import { TagsCache } from "../caches/TagsCache";
import { Paginator } from "../Paginator";
import { TagConsolidator } from "../tags/TagConsolidator";

export interface TagComboDetails {
  plays: number;
  nowplaying: boolean;
  hitMax: boolean;
  shouldIncrement: boolean;
}

export class TagComboCalculator {
  private combo = new TagCombo(
    new TagsCache(this.tagsService, this.lastFMService)
  );
  public totalTracks = 0;

  constructor(
    private tagsService: TagsService,
    private lastFMService: LastFMService
  ) {}

  async calculate(paginator: Paginator<any, RecentTracks>): Promise<TagCombo> {
    for await (let page of paginator.iterator()) {
      let tracks = await this.extractTracks(page, paginator.currentPage);

      this.totalTracks += tracks.filter((t) => !t["@attr"]?.nowplaying).length;

      for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
        let track = tracks[trackIndex];

        if (!(await this.shouldContinue())) return this.combo;

        await this.incrementCombo(
          track,
          paginator.currentPage === paginator.maxPages &&
            trackIndex === tracks.length - 1
        );
      }
    }

    return this.combo;
  }

  private async extractTracks(
    page: RecentTracks,
    pageNumber: number
  ): Promise<Track[]> {
    let tracks = page.track;

    if (!tracks.length) return [];

    if (pageNumber === 1) await this.combo.imprint(tracks[0]);

    if (pageNumber === 1) {
      return tracks;
    } else {
      return tracks.filter((t) => !t["@attr"]?.nowplaying);
    }
  }

  private async shouldContinue(): Promise<boolean> {
    return await this.combo.shouldContinue();
  }

  private async incrementCombo(track: Track, last: boolean): Promise<void> {
    await this.combo.increment(track, last);
  }
}

export class TagCombo {
  comboCollection: { [tag: string]: TagComboDetails } = {};

  constructor(private tagsCache: TagsCache) {}

  hasAnyConsecutivePlays(): boolean {
    return !!Object.values(this.comboCollection).filter((i) => i.plays > 1)
      .length;
  }

  async imprint(track: Track) {
    const nowplaying = !!track["@attr"]?.nowplaying;

    const tags = await this.getTags(track);

    for (let tag of tags) {
      const defaultDetails = {
        nowplaying,
        plays: 0,
        hitMax: false,
        shouldIncrement: true,
      } as TagComboDetails;

      this.comboCollection[tag] = defaultDetails;
    }
  }

  async increment(track: Track, hitMax: boolean) {
    if (track["@attr"]?.nowplaying) return;

    const tags = await this.getTags(track);

    for (let tag of Object.keys(this.comboCollection)) {
      if (this.comboCollection[tag]?.shouldIncrement && tags.includes(tag)) {
        this.comboCollection[tag].plays += 1;
        this.comboCollection[tag].hitMax = hitMax;
      } else if (this.comboCollection[tag]) {
        this.comboCollection[tag].shouldIncrement = false;
      }
    }
  }

  async shouldContinue(): Promise<boolean> {
    return !!Object.values(this.comboCollection)
      .map((t) => t.shouldIncrement)
      .filter((t) => t).length;
  }

  private async getTags(track: Track) {
    const tags = await this.tagsCache.getTags(track.artist["#text"]);

    return new TagConsolidator()
      .addTags(tags)
      .consolidate(Infinity, false)
      .map((t) => t.toLowerCase());
  }
}
