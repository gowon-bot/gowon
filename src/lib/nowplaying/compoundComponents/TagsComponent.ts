import { TagConsolidator } from "../../tags/TagConsolidator";
import { NowPlayingEmbed } from "../../ui/embeds/NowPlayingEmbed";
import { AnyIn, BaseCompoundComponent } from "../base/BaseNowPlayingComponent";
import { PlaceholderNowPlayingComponent } from "../base/PlaceholderNowPlayingComponent";

const areqs = ["artistInfo"] as const;
export class ArtistTagsComponent extends PlaceholderNowPlayingComponent<
  typeof areqs
> {
  static componentName = "artist-tags";
  static friendlyName = "Artist tags";
  readonly dependencies = areqs;
}

const treqs = ["trackInfo"] as const;
export class TrackTagsComponent extends PlaceholderNowPlayingComponent<
  typeof treqs
> {
  static componentName = "track-tags";
  static friendlyName = "Track tags";
  readonly dependencies = treqs;
}

const dependencies = ["artistInfo", "trackInfo"] as const;

export class TagsComponent extends BaseCompoundComponent<typeof dependencies> {
  dependencies = dependencies;

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
      size: NowPlayingEmbed.rowSize,
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
