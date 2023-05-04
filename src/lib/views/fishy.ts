import { FishyRarityData } from "../../services/fishy/Fishy";

export function displayRarity(
  rarity: FishyRarityData,
  withEmoji?: boolean
): string {
  const display = rarity.isTrash()
    ? rarity.name
    : `${rarity.special ? "Special" : rarity.name} fishy`;

  return withEmoji ? rarity.emoji + " " + display : display;
}
