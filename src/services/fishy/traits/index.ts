import { Fishy } from "../classes/Fishy";
import {
  FishyCategoryTrait,
  convertFishyCategoryTrait,
  displayFishyCategoryTrait,
  isFishyCategoryTrait,
} from "./category";
import {
  FishyDepthTrait,
  convertFishyDepthQuery,
  displayFishyDepthTrait,
  isFishyDepthTrait,
} from "./depth";
import {
  FishyNameTrait,
  convertFishyNameTrait,
  displayFishyNameTrait,
  isFishyNameTrait,
} from "./name";
import {
  FishyPhysicalTrait,
  convertFishyPhysicalTrait,
  displayFishyPhysicalTrait,
  isFishyPhysicalTrait,
} from "./physical";
import {
  FishyRegionTrait,
  continents,
  convertFishyRegionTrait,
  displayFishyRegionTrait,
  isFishyRegionTrait,
  oceans,
} from "./region";

export type FishyTrait =
  | FishyPhysicalTrait
  | FishyNameTrait
  | FishyCategoryTrait
  | FishyRegionTrait
  | FishyDepthTrait;

export function isFishyStringTrait(
  trait: string
): trait is
  | FishyPhysicalTrait
  | FishyNameTrait
  | FishyCategoryTrait
  | FishyRegionTrait {
  return (
    isFishyPhysicalTrait(trait) ||
    isFishyNameTrait(trait) ||
    isFishyCategoryTrait(trait) ||
    isFishyRegionTrait(trait)
  );
}

export function convertFishyTrait(
  string: string | undefined
): FishyTrait | undefined {
  if (!string) return undefined;

  return (
    convertFishyPhysicalTrait(string) ??
    convertFishyNameTrait(string) ??
    convertFishyCategoryTrait(string) ??
    convertFishyRegionTrait(string) ??
    convertFishyDepthQuery(string)
  );
}

export function matchesFishyTrait(fishy: Fishy, trait: FishyTrait): boolean {
  if (isFishyDepthTrait(trait)) {
    if (!fishy.depth) return false;

    if (trait.deep === -1) {
      return fishy.depth.deep >= trait.shallow;
    } else if (trait.shallow === -1) {
      return fishy.depth.shallow <= trait.deep;
    } else {
      return (
        fishy.depth.shallow <= trait.shallow && fishy.depth.deep >= trait.deep
      );
    }
  } else {
    if (
      oceans.includes(trait) &&
      fishy.traits.includes(FishyRegionTrait.AllOceans)
    ) {
      return true;
    }

    if (
      continents.includes(trait) &&
      fishy.traits.includes(FishyRegionTrait.Worldwide)
    ) {
      return true;
    }

    return fishy.traits.includes(trait);
  }
}

export function displayFishyTrait(
  trait: FishyTrait,
  withFishy?: boolean
): string {
  const withFishyString: "" | "fishy" = withFishy ? "fishy" : "";

  if (isFishyDepthTrait(trait)) {
    return displayFishyDepthTrait(trait, withFishyString);
  } else if (isFishyCategoryTrait(trait)) {
    return displayFishyCategoryTrait(trait, withFishyString);
  } else if (isFishyNameTrait(trait)) {
    return displayFishyNameTrait(trait, withFishyString);
  } else if (isFishyPhysicalTrait(trait)) {
    return displayFishyPhysicalTrait(trait, withFishyString);
  } else if (isFishyRegionTrait(trait)) {
    return displayFishyRegionTrait(trait, withFishyString);
  }

  return "";
}
