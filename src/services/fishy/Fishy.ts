import { Chance } from "chance";
import { HexColorString } from "discord.js";
import { Emoji } from "../../lib/emoji/Emoji";
import { FishyEmoji } from "../../lib/emoji/FishEmoji";

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
}

export class FishyRarityData {
  constructor(
    public name: string,
    public weight: number,
    public colour: HexColorString,
    public emoji: string,
    private objectKey?: string
  ) {}

  public isTrash(): boolean {
    return this.name === FishyRarities.Trash.name;
  }

  public get key(): keyof typeof FishyRarities {
    return (this.objectKey || this.name) as keyof typeof FishyRarities;
  }
}

export const FishyRarities = {
  // Grey
  Trash: new FishyRarityData("Trash", 10, "#929394", Emoji.trash),
  // Green
  Common: new FishyRarityData("Common", 44, "#8bc34a", Emoji.common),
  // Blue
  Uncommon: new FishyRarityData("Uncommon", 29, "#4a8bc3", Emoji.uncommon),
  // Purple
  Rare: new FishyRarityData("Rare", 10, "#be4ac3", Emoji.rare),
  // Pink
  SuperRare: new FishyRarityData(
    "Super rare",
    5.5,
    "#ffc0cb",
    Emoji.superRare,
    "SuperRare"
  ),
  // Yellow
  Legendary: new FishyRarityData("Legendary", 1.2, "#ffc107", Emoji.legendary),
  // // Red
  // Mythic: new FishyRarityData("???", 1, "#e91e63", Emoji.mythic, "Mythic"),
} as const;

export type FishyRarity = (typeof FishyRarities)[keyof typeof FishyRarities];

interface FishyOptions {
  id: string;
  name: string;
  binomialName: string;
  rarity: FishyRarity;
  description: string;
  weight: { min: number; max: number };
  emoji: FishyEmoji;
}
