import { FishyEmojiList } from "../../../lib/emoji/FishyEmoji";
import { FishyRarityEmojiList } from "../../../lib/emoji/FishyRarityEmoji";
import { BaseFishy } from "../classes/BaseFishy";
import { Fishy, FishyRarityData } from "../classes/Fishy";

export const specialFishies = [
  new Fishy({
    id: "blahaj",
    name: "Blåhaj",
    binomialName: "Carcharhinus blåhaj",
    rarity: new FishyRarityData(
      "Blåhaj",
      0.1,
      "#f5a8b9",
      FishyRarityEmojiList.blahajRarity,
      "special",
      true
    ),
    description: "Trans rights!",
    emoji: FishyEmojiList.blahaj,
    weight: {
      min: 999,
      max: 999,
    },
  }),
] satisfies BaseFishy[];
