import { looseCompare } from "../../../helpers/string";

export enum FishyNameTrait {
  ColorInName = "colorInName",
  PlaceInName = "placeInName",
  AdjectiveInName = "adjectiveInName",
}

export function isFishyNameTrait(trait: string): trait is FishyNameTrait {
  return Object.values(FishyNameTrait).includes(trait as FishyNameTrait);
}

export function convertFishyNameTrait(
  trait: string
): FishyNameTrait | undefined {
  return Object.entries(FishyNameTrait).find(
    ([k, v]) => looseCompare(k, trait) || looseCompare(v, trait)
  )?.[1];
}

export function displayFishyNameTrait(
  trait: FishyNameTrait,
  withFishy: "" | "fishy"
): string {
  const withFunc = (str: string) =>
    `${withFishy} with ${str} in its name`.trim();

  switch (trait) {
    case FishyNameTrait.AdjectiveInName:
      return withFunc("an adjective");

    case FishyNameTrait.PlaceInName:
      return withFunc("a place");

    case FishyNameTrait.ColorInName:
      return withFunc("a color");
  }
}
