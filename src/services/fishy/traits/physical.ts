import { looseCompare } from "../../../helpers/native/string";

export enum FishyPhysicalTrait {
  Striped = "striped",
  Spotted = "spotted",

  // Colors
  Red = "red",
  Yellow = "yellow",
  Blue = "blue",
  Purple = "purple",
  Transparent = "transparent",
}

export function isFishyPhysicalTrait(
  trait: string
): trait is FishyPhysicalTrait {
  return Object.values(FishyPhysicalTrait).includes(
    trait as FishyPhysicalTrait
  );
}

export function convertFishyPhysicalTrait(
  trait: string
): FishyPhysicalTrait | undefined {
  return Object.entries(FishyPhysicalTrait).find(
    ([k, v]) => looseCompare(k, trait) || looseCompare(v, trait)
  )?.[1];
}

export function displayFishyPhysicalTrait(
  trait: FishyPhysicalTrait,
  withFishy: "" | "fishy"
): string {
  return `${trait} ${withFishy}`.trim();
}
