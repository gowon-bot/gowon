import { convertLilacDate } from "../../../helpers/lilac";
import { LilacDate } from "../../../services/lilac/LilacAPIService.types";
import { displayDateNoTime } from "../../ui/displays";
import { NowPlayingEmbed } from "../../ui/embeds/NowPlayingEmbed";
import {
  AnyIn,
  BaseCompoundComponent,
  RenderedComponent,
} from "../base/BaseNowPlayingComponent";

const dependencies = [
  "artistCount",
  "albumCount",
  "ambiguousTrackCount",
] as const;

export class LastPlayedComponent extends BaseCompoundComponent<
  typeof dependencies
> {
  dependencies = dependencies;

  static componentName = "last-played";
  static replaces = new AnyIn([
    "artist-last-played",
    "album-last-played",
    "track-last-played",
  ]);

  async render(): Promise<RenderedComponent> {
    const componentsReplaced = this.values.components.filter((c) =>
      c.includes("last-played")
    );

    if (componentsReplaced.length === 1) {
      return this.renderSingleComponent(componentsReplaced);
    } else {
      return this.renderMultipleComponents(componentsReplaced);
    }
  }

  private renderSingleComponent(
    componentsReplaced: string[]
  ): RenderedComponent {
    const component = componentsReplaced[0];

    if (component === "artist-last-played" && this.values.artistCount) {
      return this.renderSingleComponentFromParts(
        "Artist",
        this.values.artistCount?.lastScrobbled
      );
    }

    if (component === "album-last-played" && this.values.albumCount) {
      return this.renderSingleComponentFromParts(
        "Album",
        this.values.albumCount?.lastScrobbled
      );
    }

    if (component === "track-last-played" && this.values.ambiguousTrackCount) {
      return this.renderSingleComponentFromParts(
        "Track",
        this.values.ambiguousTrackCount?.lastScrobbled
      );
    }

    return { string: "", size: 0 };
  }

  private renderMultipleComponents(
    componentsReplaced: string[]
  ): RenderedComponent {
    const displayArtist =
      componentsReplaced.includes("artist-last-played") &&
      this.values.artistCount?.lastScrobbled;
    const displayAlbum =
      componentsReplaced.includes("album-last-played") &&
      this.values.albumCount?.lastScrobbled;
    const displayTrack =
      componentsReplaced.includes("track-last-played") &&
      this.values.ambiguousTrackCount?.lastScrobbled;

    const parts = [
      displayArtist
        ? `Artist: ${displayDateNoTime(
            convertLilacDate(this.values.artistCount!.lastScrobbled)
          )}`
        : "",
      displayAlbum
        ? `Album: ${displayDateNoTime(
            convertLilacDate(this.values.albumCount!.lastScrobbled)
          )}`
        : "",
      displayTrack
        ? `Track: ${displayDateNoTime(
            convertLilacDate(this.values.ambiguousTrackCount!.lastScrobbled)
          )}`
        : "",
    ];

    return {
      string: `Last played — ${parts.filter((part) => part !== "").join(", ")}`,
      size: NowPlayingEmbed.rowSize,
    };
  }

  private renderSingleComponentFromParts(
    entity: string,
    date: LilacDate
  ): RenderedComponent {
    return {
      string: `${entity} last played ${displayDateNoTime(
        convertLilacDate(date)
      )}`,
      size: 1.5,
    };
  }
}
