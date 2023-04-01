import { extractEmojiID } from "../../lib/emoji/Emoji";
import { Fishy, FishyRarities, FishyRarityData } from "./Fishy";
import { commonFishies } from "./fishy/common";
import { rareFishies } from "./fishy/rare";
import { superRareFishies } from "./fishy/superRare";
import { trash } from "./fishy/trash";
import { uncommonFishy } from "./fishy/uncommon";

export const fishyList = [
  ...trash,
  ...commonFishies,
  ...uncommonFishy,
  ...rareFishies,
  ...superRareFishies,
];

export function getFishyList(rarity: FishyRarityData): Fishy[] {
  switch (rarity.name) {
    case FishyRarities.Trash.name:
      return trash;

    case FishyRarities.Common.name:
      return commonFishies;

    case FishyRarities.Uncommon.name:
      return uncommonFishy;

    case FishyRarities.Rare.name:
      return rareFishies;

    case FishyRarities.SuperRare.name:
      return superRareFishies;

    default:
      return fishyList;
  }
}

export function findFishy(
  name: string | { byID: string } | { byEmoji: string }
): Fishy | undefined {
  const equalize = (str: string) => str.toLowerCase().replace(/[\s-_]+/, "");

  return fishyList.find((f) => {
    return typeof name === "string"
      ? equalize(f.name) === equalize(name) || equalize(f.id) === equalize(name)
      : isByEmoji(name)
      ? extractEmojiID(f.emoji) === extractEmojiID(name.byEmoji) ||
        extractEmojiID(f.emojiInWater) === extractEmojiID(name.byEmoji)
      : f.id === name.byID;
  });
}

function isByEmoji(
  name: Record<string, string | string>
): name is { byEmoji: string } {
  return typeof (name as any)?.byEmoji === "string";
}
