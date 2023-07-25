import { type FishyTrait } from ".";
import {
  looseCompare,
  titlecase,
  uppercaseFirst,
} from "../../../helpers/native/string";

export enum FishyRegionTrait {
  AtlanticOcean = "atlantic",
  PacificOcean = "pacific",
  ArcticOcean = "arctic",
  IndianOcean = "indian",
  AllOceans = "all",

  MediterraneanSea = "mediterranean",

  NorthAmerica = "north america",
  SouthAmerica = "south america",
  Asia = "asia",
  Oceania = "oceania",
  Africa = "africa",
  Europe = "europe",
  Worldwide = "worldwide",
}

export const oceans: FishyTrait[] = [
  FishyRegionTrait.PacificOcean,
  FishyRegionTrait.AtlanticOcean,
  FishyRegionTrait.ArcticOcean,
  FishyRegionTrait.IndianOcean,
];

export const continents: FishyTrait[] = [
  FishyRegionTrait.Asia,
  FishyRegionTrait.Africa,
  FishyRegionTrait.Europe,
  FishyRegionTrait.NorthAmerica,
  FishyRegionTrait.SouthAmerica,
  FishyRegionTrait.Oceania,
];

export function isFishyRegionTrait(trait: string): trait is FishyRegionTrait {
  return Object.values(FishyRegionTrait).includes(trait as FishyRegionTrait);
}

export function convertFishyRegionTrait(
  trait: string
): FishyRegionTrait | undefined {
  return Object.entries(FishyRegionTrait).find(
    ([k, v]) => looseCompare(k, trait) || looseCompare(v, trait)
  )?.[1];
}

export function displayFishyRegionTrait(
  trait: FishyRegionTrait,
  withFishy: "" | "fishy"
): string {
  const withFunc = (str: string) => `${withFishy} found ${str}`.trim();

  switch (trait) {
    case FishyRegionTrait.PacificOcean:
    case FishyRegionTrait.AtlanticOcean:
    case FishyRegionTrait.ArcticOcean:
    case FishyRegionTrait.IndianOcean:
      return withFunc(`in the ${uppercaseFirst(trait)} Ocean`);

    case FishyRegionTrait.AllOceans:
      return withFunc(`in all oceans`);

    case FishyRegionTrait.MediterraneanSea:
      return withFunc(`in the Mediterranean sea`);

    case FishyRegionTrait.Worldwide:
      return withFunc(trait);

    default:
      return withFunc(
        "in " + (continents.includes(trait) ? titlecase(trait) : trait)
      );
  }
}
