import { FishyCatch } from "../../database/entity/fishy/FishyCatch";
import { Fishy } from "./Fishy";
import { FishyRarities } from "./rarity";

export interface FishyResult {
  fishy: Fishy;
  weight: number;
  isNew: boolean;
}

export type FishyRarityBreakdown = {
  [k in keyof typeof FishyRarities]: number;
};

export interface AquariumDimensions {
  width: number;
  height: number;
}

export interface Aquarium {
  fishies: FishyCatch[];
  size: number;
  mostAbundantFish: Fishy;
}
