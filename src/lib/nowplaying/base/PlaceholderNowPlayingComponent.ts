import {
  BaseNowPlayingComponent,
  NowPlayingRequirement,
} from "./BaseNowPlayingComponent";

/**
 * Placeholder components are components that are never resolved because they
 * are always replaced by a compound component
 *
 * For example: the Loved component is always replaced by a LovedAndOwned component,
 * therefore it is merely a placeholder
 */
export abstract class PlaceholderNowPlayingComponent<
  Requirements extends readonly NowPlayingRequirement[]
> extends BaseNowPlayingComponent<Requirements> {
  public present() {
    return { size: 0, string: "" };
  }
}
