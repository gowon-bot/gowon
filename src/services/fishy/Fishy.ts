import { Chance } from "chance";
import { HexColorString } from "discord.js";

export class Fishy {
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
    return this.options.emoji || "🐟";
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
}

export class FishyRarityData {
  constructor(
    public name: string,
    public weight: number,
    public colour: HexColorString
  ) {}

  public isTrash(): boolean {
    return this.name === FishyRarities.Trash.name;
  }
}

export const FishyRarities = {
  // Grey
  Trash: new FishyRarityData("Trash", 10, "#929394"),
  // Green
  Common: new FishyRarityData("Common", 44, "#8bc34a"),
  // // Blue
  // Uncommon: new FishyRarityData("Uncommon", 29, "#4a8bc3"),
  // Purple
  Rare: new FishyRarityData("Rare", 10, "#be4ac3"),
  // // Pink
  // SuperRare: new FishyRarityData("Super rare", 5.5, "#ffc0cb"),
  // // Yellow
  // Legendary: new FishyRarityData("Legendary", 1.2, "#ffc107"),
  // // Red
  // Mythic: new FishyRarityData("???", 0.3, "#e91e63"),
} as const;

export type FishyRarity = (typeof FishyRarities)[keyof typeof FishyRarities];

interface FishyOptions {
  id: string;
  name: string;
  binomialName: string;
  rarity: FishyRarity;
  description: string;
  weight: { min: number; max: number };
  emoji?: string;
}
