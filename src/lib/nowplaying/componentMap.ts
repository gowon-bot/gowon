import { AlbumPlaysComponent } from "./components/AlbumPlaysComponent";
import { ArtistPlaysComponent } from "./components/ArtistPlaysComponent";
import { BaseNowPlayingComponent } from "./components/BaseNowPlayingComponent";
import { ScrobblesComponent } from "./components/ScrobblesComponent";
import {
  ArtistTagsComponent,
  TagsComponent,
  TrackTagsComponent,
} from "./compoundComponents/TagsComponent";
import { TrackPlaysComponent } from "./components/TrackPlaysComponent";
import { ArtistCrownComponent } from "./components/ArtistCrownComponent";
import { ArtistPlaysAndCrownComponent } from "./compoundComponents/ArtistPlaysAndCrown";
import { RatingComponent } from "./components/RatingComponent";

// Types
export type NowPlayingComponent = {
  new (values: any): BaseNowPlayingComponent<any>;
};

type ComponentMap = {
  [component: string]: NowPlayingComponent;
};

// Lists
// Note: This list is used to determine order. The components will appear in this order in lists
// and when the embed is generated, it sorts using order before checking size
const componentList = [
  ArtistPlaysComponent,
  AlbumPlaysComponent,
  TrackPlaysComponent,
  ScrobblesComponent,
  ArtistCrownComponent,
  RatingComponent,

  // Placeholder components
  ArtistTagsComponent,
  TrackTagsComponent,
] as const;

export const compoundComponentList = [
  ArtistPlaysAndCrownComponent,

  // TagsComponent should always be last because it takes up the most space
  TagsComponent,
] as const;

// Maps
export const componentMap = componentList.reduce((acc, val) => {
  if (val instanceof String) {
    return acc;
  }

  const name = val.componentName;

  acc[name] = val;

  return acc;
}, {} as ComponentMap);

export const compoundComponentMap = compoundComponentList.reduce((acc, val) => {
  const name = val.componentName;

  acc[name] = val;

  return acc;
}, {} as ComponentMap);

// Functions
export function getComponentByName(
  name: string
): NowPlayingComponent | undefined {
  return componentMap[name] || compoundComponentMap[name];
}

export function sortConfigOptions(config: string[]): string[] {
  const options = [];

  for (const component of componentList) {
    if (config.includes(component.componentName)) {
      options.push(component.componentName);
    }
  }

  return options;
}
