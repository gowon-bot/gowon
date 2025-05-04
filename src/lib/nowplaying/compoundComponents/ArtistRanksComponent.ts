import { getOrdinal } from "../../../helpers";
import { displayNumber } from "../../ui/displays";
import {
  AnyIn,
  BaseCompoundComponent,
  RenderedComponent,
} from "../base/BaseNowPlayingComponent";

const dependencies = ["serverArtistRank", "globalArtistRank"] as const;

export class ArtistRanksComponent extends BaseCompoundComponent<
  typeof dependencies
> {
  dependencies = dependencies;

  static componentName = "artist-ranks";
  static replaces = new AnyIn(["server-artist-rank", "global-artist-rank"]);

  async render(): Promise<RenderedComponent> {
    const componentsReplaced = this.values.components.filter((c) =>
      c.includes("artist-rank")
    );

    if (componentsReplaced.length === 1) {
      return this.renderSingleComponent(componentsReplaced);
    } else {
      return this.renderMultipleComponents();
    }
  }

  private renderSingleComponent(
    componentsReplaced: string[]
  ): RenderedComponent {
    const component = componentsReplaced[0];

    if (
      component === "server-artist-rank" &&
      this.values.serverArtistRank &&
      this.values.serverArtistRank.rank != -1
    ) {
      return this.renderSingleComponentFromParts(
        "Server",
        this.values.serverArtistRank.rank,
        this.values.serverArtistRank.totalListeners
      );
    }

    if (
      component === "global-artist-rank" &&
      this.values.globalArtistRank &&
      this.values.globalArtistRank.rank != -1
    ) {
      return this.renderSingleComponentFromParts(
        "Global",
        this.values.globalArtistRank.rank,
        this.values.globalArtistRank.totalListeners
      );
    }

    return { string: "", size: 0 };
  }

  private renderMultipleComponents(): RenderedComponent {
    return {
      string: `Artist rank — ${getOrdinal(
        this.values.serverArtistRank.rank
      )}/${displayNumber(
        this.values.serverArtistRank.totalListeners
      )} (server), ${getOrdinal(
        this.values.globalArtistRank.rank
      )}/${displayNumber(
        this.values.globalArtistRank.totalListeners
      )} (global)`,
      size: 1,
    };
  }

  private renderSingleComponentFromParts(
    scope: string,
    rank: number,
    totalListeners: number
  ): RenderedComponent {
    return {
      string: `${scope} rank: ${getOrdinal(rank)}/${displayNumber(
        totalListeners
      )}`,
      size: 1,
    };
  }
}
