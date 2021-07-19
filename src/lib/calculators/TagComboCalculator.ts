import { TagsService } from "../../services/dbservices/tags/TagsService";
import {
  RecentTrack,
  RecentTracks,
} from "../../services/LastFM/converters/RecentTracks";
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
  private combo = new TagCombo(new TagsCache(this.tagsService));
  public totalTracks = 0;

  constructor(private tagsService: TagsService) {}

  async calculate(paginator: Paginator<any, RecentTracks>): Promise<TagCombo> {
    for await (let page of paginator.iterator()) {
      await this.cacheTags(page.tracks);

      let tracks = await this.extractTracks(page, paginator.currentPage);

      this.totalTracks += tracks.filter((t) => !t.isNowPlaying).length;

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
  ): Promise<RecentTrack[]> {
    let tracks = page.tracks;

    if (!tracks.length) return [];

    if (pageNumber === 1) await this.combo.imprint(page.first());

    if (pageNumber === 1) {
      return tracks;
    } else {
      return tracks.filter((t) => !t.isNowPlaying);
    }
  }

  private async shouldContinue(): Promise<boolean> {
    return await this.combo.shouldContinue();
  }

  private async incrementCombo(
    track: RecentTrack,
    last: boolean
  ): Promise<void> {
    await this.combo.increment(track, last);
  }

  private async cacheTags(tracks: RecentTrack[]) {
    await this.combo.tagsCache.initialCache(tracks.map((t) => t.artist));
  }
}

export class TagCombo {
  comboCollection: { [tag: string]: TagComboDetails } = {};

  constructor(public tagsCache: TagsCache) {}

  hasAnyConsecutivePlays(): boolean {
    return !!Object.values(this.comboCollection).filter((i) => i.plays > 1)
      .length;
  }

  async imprint(track: RecentTrack) {
    const nowplaying = !!track.isNowPlaying;

    const tags = await this.getTags(track);

    console.log(tags);

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

  async increment(track: RecentTrack, hitMax: boolean) {
    if (track.isNowPlaying) return;

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
    return Object.values(this.comboCollection)
      .map((t) => t.shouldIncrement)
      .some((t) => !!t);
  }

  private async getTags(track: RecentTrack) {
    const tags = await this.tagsCache.getTags(track.artist);

    return new TagConsolidator()
      .addTags(tags)
      .consolidateAsStrings(Infinity, false)
      .map((t) => t.toLowerCase());
  }
}
