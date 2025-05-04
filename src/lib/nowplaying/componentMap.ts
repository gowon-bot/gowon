import { UNUSED_CONFIG } from "../../services/dbservices/NowPlayingService";
import { Choice } from "../context/arguments/argumentTypes/StringArgument";
import { BaseNowPlayingComponent } from "./base/BaseNowPlayingComponent";
import { AlbumLastPlayedComponent } from "./components/AlbumLastPlayedComponent";
import { AlbumPlaysComponent } from "./components/AlbumPlaysComponent";
import { ArtistCrownComponent } from "./components/ArtistCrownComponent";
import { ArtistLastPlayedComponent } from "./components/ArtistLastPlayedComponent";
import { ArtistPlaysComponent } from "./components/ArtistPlaysComponent";
import { CardOwnershipComponent } from "./components/CardOwnershipComponent";
import { FishyReminderComponent } from "./components/FishyReminderComponent";
import { GlobalArtistRankComponent } from "./components/GlobalArtistRankComponent";
import { ListenersComponent } from "./components/ListenersComponent";
import { LovedComponent } from "./components/LovedComponent";
import { RatingComponent } from "./components/RatingComponent";
import { ScrobblesComponent } from "./components/ScrobblesComponent";
import { ServerArtistRankComponent } from "./components/ServerArtistRankComponent";
import { TrackLastPlayedComponent } from "./components/TrackLastPlayedComponent";
import { TrackPlaysComponent } from "./components/TrackPlaysComponent";
import { ArtistPlaysAndCrownComponent } from "./compoundComponents/ArtistPlaysAndCrown";
import { ArtistRanksComponent } from "./compoundComponents/ArtistRanksComponent";
import { LastPlayedComponent } from "./compoundComponents/LastPlayedComponent";
import { LovedAndOwnedComponent } from "./compoundComponents/LovedAndOwnedComponent";
import {
  ArtistTagsComponent,
  TagsComponent,
  TrackTagsComponent,
} from "./compoundComponents/TagsComponent";

// Types
export type NowPlayingComponent = {
  new (values: any): BaseNowPlayingComponent<any>;
  componentName: string;
  patronOnly: boolean;
};

type ComponentMap = {
  [component: string]: NowPlayingComponent;
};

// Lists
// Note: This list is used to determine order. The components will appear in this order in lists
// and when the embed is generated, it sorts using order before checking size
const componentList = [
  CardOwnershipComponent,
  LovedComponent,
  FishyReminderComponent,
  ArtistPlaysComponent,
  AlbumPlaysComponent,
  TrackPlaysComponent,
  ScrobblesComponent,
  ArtistCrownComponent,
  RatingComponent,
  ListenersComponent,

  // Placeholder components
  ServerArtistRankComponent,
  GlobalArtistRankComponent,
  ArtistLastPlayedComponent,
  AlbumLastPlayedComponent,
  TrackLastPlayedComponent,
  ArtistTagsComponent,
  TrackTagsComponent,
] as const;

export const compoundComponentList = [
  LovedAndOwnedComponent,
  ArtistPlaysAndCrownComponent,
  ArtistRanksComponent,
  LastPlayedComponent,

  // TagsComponent should always be last because it takes up the most space
  TagsComponent,
] as const;

// Maps
export const componentMap = componentList.reduce((acc, val) => {
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
export function getComponents(showSecret = false): NowPlayingComponent[] {
  return componentList.filter((c) => {
    return showSecret || !c.secret;
  });
}

export function getComponentByName(
  name: string
): NowPlayingComponent | undefined {
  return componentMap[name] || compoundComponentMap[name];
}

export function sortConfigOptions(config: string[]): string[] {
  if (config[0] === UNUSED_CONFIG) {
    return config;
  }

  const options = [];

  for (const component of componentList) {
    if (config.includes(component.componentName)) {
      options.push(component.componentName);
    }
  }

  return options;
}

export function getComponentsAsChoices(): Choice[] {
  return componentList.map((c) => ({
    name: c.friendlyName,
    value: c.componentName,
  }));
}
