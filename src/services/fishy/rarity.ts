import { HexColorString } from "discord.js";
import {
  FishyRarityEmoji,
  FishyRarityEmojis,
} from "../../lib/emoji/FishyRarityEmoji";

export class FishyRarityData {
  constructor(
    public name: string,
    public weight: number,
    public colour: HexColorString,
    public emoji: FishyRarityEmoji,
    private objectKey?: string,
    public special?: boolean
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
  Trash: new FishyRarityData("Trash", 10, "#929394", FishyRarityEmojis.trash),
  // Green
  Common: new FishyRarityData(
    "Common",
    44,
    "#8bc34a",
    FishyRarityEmojis.common
  ),
  // Blue
  Uncommon: new FishyRarityData(
    "Uncommon",
    29,
    "#4a8bc3",
    FishyRarityEmojis.uncommon
  ),
  // Purple
  Rare: new FishyRarityData("Rare", 10, "#be4ac3", FishyRarityEmojis.rare),
  // Pink
  SuperRare: new FishyRarityData(
    "Super rare",
    5.5,
    "#ffc0cb",
    FishyRarityEmojis.superRare,
    "SuperRare"
  ),
  // Yellow
  Legendary: new FishyRarityData(
    "Legendary",
    1.2,
    "#ffc107",
    FishyRarityEmojis.legendary
  ),
  // // Red
  // Mythic: new FishyRarityData("???", 0.3, "#e91e63", Emoji.mythic, "Mythic"),
} as const;

export type FishyRarityKey = keyof typeof FishyRarities;
export type FishyRarity = (typeof FishyRarities)[FishyRarityKey];
