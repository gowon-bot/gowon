import { Chance } from "chance";
import { FishyEmoji } from "../../../lib/emoji/FishyEmoji";
import { FishyRarity, FishyRarityData } from "./Fishy";

export enum FishyDisplayMode {
  Floating,
  Bottom,
}

interface FishyOptions {
  id: string;
  name: string;
  binomialName: string;
  rarity: FishyRarity | FishyRarityData;
  description: string;
  weight: { min: number; max: number };
  emoji: FishyEmoji;
  displayMode?: FishyDisplayMode;
}

export abstract class BaseFishy {
  abstract requiredFishyLevel: number;

  constructor(private options: FishyOptions) {}

  public pickWeight(): number {
    return Chance().floating({ ...this.options.weight, fixed: 1 });
  }

  get id(): string {
    return this.options.id;
  }

  get name(): string {
    return this.options.name;
  }

  get binomialName(): string {
    return this.options.binomialName;
  }

  get rarity(): FishyRarityData {
    return this.options.rarity;
  }

  get emoji(): string {
    return this.options.emoji.raw;
  }

  get emojiInWater(): string {
    return this.options.emoji.inWater;
  }

  get emojiSilhouette(): string {
    return this.options.emoji.silhouette;
  }

  get description(): string {
    return this.options.description;
  }

  get minWeight(): number {
    return this.options.weight.min;
  }

  get maxWeight(): number {
    return this.options.weight.max;
  }

  get hidden(): boolean {
    return !!this.rarity.special;
  }

  get displayMode(): FishyDisplayMode {
    return this.options.displayMode || FishyDisplayMode.Floating;
  }
}
