import { bold } from "../../helpers/discord";
import { Fishy } from "../../services/fishy/Fishy";
import { fishyList } from "../../services/fishy/fishyList";
import { FishyRarityData } from "../../services/fishy/rarity";
import { Emoji } from "../emoji/Emoji";
import { displayNumber } from "./displays";

export function displayRarity(
  rarity: FishyRarityData,
  withEmoji?: boolean,
  forFishy?: Fishy
): string {
  const display = rarity.isTrash()
    ? rarity.name
    : `${rarity.special ? "Special" : rarity.name} fishy`;

  return withEmoji
    ? rarity.emoji.forLevel(forFishy?.requiredFishyLevel) + " " + display
    : display;
}

const levelUpMessages = [
  `You have unlocked the **net**! You can now catch ${Emoji.level2Fishy} **level 2** fishy! (small floating marine animals, like shrimp and seahorses)`,
  `You have unlocked the **gloves**! You can now pick up ${Emoji.level3Fishy} **level 3** fishy! (marine animals found on the ocean floor)`,
];

export function displayFishyLevelUp(level: number): string {
  const levelUpMessage = levelUpMessages[level - 2];

  return (
    `You've leveled up to level ${bold(level)}` +
    (levelUpMessage ? "\n\n" + levelUpMessage : "")
  );
}

export function displayFishyCollectionProgress(collection: string[]) {
  const noHidden = fishyList.filter((f) => !f.hidden);

  return `${displayNumber(collection.length)} of ${noHidden.length}`;
}
