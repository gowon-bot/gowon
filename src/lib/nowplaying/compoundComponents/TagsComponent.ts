import { TagConsolidator } from "../../tags/TagConsolidator";
import { rowSize } from "../NowPlayingBuilder";
import {
  AnyIn,
  BaseCompoundComponent,
  BaseNowPlayingComponent,
} from "../components/BaseNowPlayingComponent";

// The following classes are placeholders because they will be replaced with the compound tags component
const areqs = ["artistInfo"] as const;
export class ArtistTagsComponent extends BaseNowPlayingComponent<typeof areqs> {
  static componentName = "artist-tags";
  readonly requirements = areqs;

  present() {
    return { string: "", size: 0 };
  }
}

// const lreqs = ["albumInfo"] as const;
// export class AlbumTagsComponent extends BaseNowPlayingComponent<typeof lreqs> {
//   static name = "album-tags";
//   readonly requirements = lreqs;

//   present() {
//      return { string: "", size: 0 };
//   }
// }

const treqs = ["trackInfo"] as const;
export class TrackTagsComponent extends BaseNowPlayingComponent<typeof treqs> {
  static componentName = "track-tags";
  readonly requirements = treqs;

  present() {
    return { string: "", size: 0 };
  }
}

const requirements = ["artistInfo", "trackInfo"] as const;

export class TagsComponent extends BaseCompoundComponent<typeof requirements> {
  requirements = requirements;

  static componentName = "tags";
  static replaces = new AnyIn(["artist-tags", "track-tags"]);

  async present() {
    const tagConsolidator = new TagConsolidator();

    this.blacklistTags(tagConsolidator);
    await this.addTags(tagConsolidator);

    return {
      string: tagConsolidator
        .consolidateAsStrings(Infinity, false)
        .join(TagConsolidator.tagJoin),
      size: rowSize,
    };
  }

  private blacklistTags(consolidator: TagConsolidator) {
    if (this.values.artistInfo) {
      consolidator.blacklistTags(this.values.artistInfo.name);
    }

    if (this.values.trackInfo) {
      consolidator.blacklistTags(this.values.trackInfo.name);
    }
  }

  private async addTags(consolidator: TagConsolidator) {
    await consolidator.saveServerBannedTagsInContext(this.ctx);

    if (
      this.values.artistInfo &&
      this.values.components.includes("artist-tags")
    ) {
      consolidator.addTags(this.ctx, this.values.artistInfo.tags);
    }

    if (
      this.values.trackInfo &&
      this.values.components.includes("track-tags")
    ) {
      consolidator.addTags(this.ctx, this.values.trackInfo.tags);
    }
  }
}
