import { Emoji } from "../../../lib/emoji/Emoji";
import { FishyEmojiList } from "../../../lib/emoji/FishEmoji";
import { Fishy, FishyRarityData } from "../Fishy";

export const specialFishies = [
  new Fishy({
    id: "blahaj",
    name: "Blåhaj",
    binomialName: "Carcharhinus blåhaj",
    rarity: new FishyRarityData(
      "Blåhaj",
      0.6,
      "#f5a8b9",
      Emoji.blahajRarity,
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
] satisfies Fishy[];
