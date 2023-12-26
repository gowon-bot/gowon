import {
  BaseNowPlayingComponent,
  NowPlayingDependency,
} from "./BaseNowPlayingComponent";

/**
 * Placeholder components are components that are never resolved because they
 * are always replaced by a compound component
 *
 * For example: the Loved component is always replaced by a LovedAndOwned component,
 * therefore it is merely a placeholder
 */
export abstract class PlaceholderNowPlayingComponent<
  Dependencies extends readonly NowPlayingDependency[]
> extends BaseNowPlayingComponent<Dependencies> {
  public render() {
    return { size: 0, string: "" };
  }
}
