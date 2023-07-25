import { looseCompare } from "../../../helpers/native/string";

export enum FishyNameTrait {
  Color = "color",
  Place = "place",
  Adjective = "adjective",
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
    withFishy
      ? `${withFishy} with ${str} in its name`
      : `has ${str} in its name`;

  switch (trait) {
    case FishyNameTrait.Adjective:
      return withFunc("an adjective");

    case FishyNameTrait.Place:
      return withFunc("a place");

    case FishyNameTrait.Color:
      return withFunc("a color");
  }
}
