import { extractEmojiID } from "../../lib/emoji/Emoji";
import { BaseFishy } from "./classes/BaseFishy";
import { FishyRarities, FishyRarityData } from "./classes/Fishy";
import { commonFishies } from "./fishy/common";
import { legendaryFishies } from "./fishy/legendary";
import { rareFishies } from "./fishy/rare";
import { specialFishies } from "./fishy/special";
import { superRareFishies } from "./fishy/superRare";
import { trash } from "./fishy/trash";
import { uncommonFishy } from "./fishy/uncommon";

export const fishyList = [
  ...trash,
  ...commonFishies,
  ...uncommonFishy,
  ...rareFishies,
  ...superRareFishies,
  ...legendaryFishies,
  ...specialFishies,
];

export function getFishyList(
  rarity: FishyRarityData,
  fishyProfileLevel?: number
): BaseFishy[] {
  let fishies: BaseFishy[];

  switch (rarity.name) {
    case FishyRarities.Trash.name:
      fishies = trash;
      break;

    case FishyRarities.Common.name:
      fishies = commonFishies;
      break;

    case FishyRarities.Uncommon.name:
      fishies = uncommonFishy;
      break;

    case FishyRarities.Rare.name:
      fishies = rareFishies;
      break;

    case FishyRarities.SuperRare.name:
      fishies = superRareFishies;
      break;

    case FishyRarities.Legendary.name:
      fishies = legendaryFishies;
      break;

    default:
      fishies = specialFishies.filter((f) => f.rarity.name === rarity.name);
  }

  if (fishyProfileLevel !== undefined) {
    return fishies.filter((f) => fishyProfileLevel >= f.requiredFishyLevel);
  } else return fishies;
}

export function findFishy(
  name: string | { byID: string } | { byEmoji: string }
): BaseFishy | undefined {
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
