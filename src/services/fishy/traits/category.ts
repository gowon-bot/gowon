import { looseCompare, uppercaseFirst } from "../../../helpers/string";

export enum FishyCategoryTrait {
  // Level 1
  Grouper = "grouper",
  Perciform = "perciform",
  Cod = "cod",
  Surgeonfish = "surgeonfish",

  // Level 2
  Shrimp = "shrimp",
  Seahorse = "seahorse",

  // Level 3
  Urchin = "urchin",
  Lobster = "lobster",
  Crab = "crab",

  // Misc
  Invasive = "invasive",
  Freshwater = "freshwater",
  Saltwater = "saltwater",
}

export function isFishyCategoryTrait(
  trait: string
): trait is FishyCategoryTrait {
  return Object.values(FishyCategoryTrait).includes(
    trait as FishyCategoryTrait
  );
}

export function convertFishyCategoryTrait(
  trait: string
): FishyCategoryTrait | undefined {
  return Object.entries(FishyCategoryTrait).find(
    ([k, v]) => looseCompare(k, trait) || looseCompare(v, trait)
  )?.[1];
}

export function displayFishyCategoryTrait(
  trait: FishyCategoryTrait,
  _withFishy: "" | "fishy"
): string {
  const withFunc = (str: string) => `${str} fishy`;

  switch (trait) {
    case FishyCategoryTrait.Invasive:
    case FishyCategoryTrait.Saltwater:
    case FishyCategoryTrait.Freshwater:
      return withFunc(trait);

    default:
      return withFunc(uppercaseFirst(trait));
  }
}
