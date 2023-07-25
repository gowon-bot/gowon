import { toInt } from "../../../helpers/native/number";

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
  const withFunc = (str: string) => `${withFishy} found ${str}`.trim();

  if (trait.deep === -1) {
    return withFunc(`at ${trait.shallow}m or deeper`);
  } else if (trait.shallow === -1) {
    return withFunc(`at up to ${trait.deep}m`);
  } else if (trait.deep === trait.shallow) {
    return withFunc(`at ${trait.deep}m`);
  } else {
    return withFunc(`between ${trait.shallow}m and ${trait.deep}m`);
  }
}
