import { toInt } from "../../../helpers/lastfm";

export class FishyDepthTrait {
  constructor(public shallow: number, public deep: number) {}
}

export function isFishyDepthTrait(trait: unknown): trait is FishyDepthTrait {
  return trait instanceof FishyDepthTrait;
}

const fishyDepthQueryRegex = /(\>|\<)?\s*([\d\,]+)\s*m/;

export function convertFishyDepthQuery(
  query: string
): FishyDepthTrait | undefined {
  const [, operator, depth] = query.match(fishyDepthQueryRegex) || [];

  if (depth) {
    if (operator === ">") {
      return new FishyDepthTrait(toInt(depth), -1);
    } else if (operator === "<") {
      return new FishyDepthTrait(-1, toInt(depth));
    } else {
      return new FishyDepthTrait(toInt(depth), toInt(depth));
    }
  }

  return undefined;
}

export function displayFishyDepthTrait(
  trait: FishyDepthTrait,
  withFishy: "" | "fishy"
): string {
  if (trait.deep === -1) {
    return `${withFishy} found at ${trait.shallow}m or deeper`.trim();
  } else if (trait.shallow === -1) {
    return `${withFishy} found at up to ${trait.deep}m`.trim();
  } else {
    return `${withFishy} found at ${trait.deep}m`.trim();
  }
}
