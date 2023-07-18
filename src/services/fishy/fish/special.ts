import { FishyEmojis } from "../../../lib/emoji/FishyEmoji";
import { FishyRarityEmojis } from "../../../lib/emoji/FishyRarityEmoji";
import { Fishy, Level1Fishy } from "../Fishy";
import { FishyRarityData } from "../rarity";
import { FishyRegionTrait } from "../traits/region";

export const specialFishies = [
  new Level1Fishy({
    id: "blahaj",
    name: "Blåhaj",
    binomialName: "Carcharhinus blåhaj",
    rarity: new FishyRarityData(
      "Blåhaj",
      0.1,
      "#f5a8b9",
      FishyRarityEmojis.blahajRarity,
      "special",
      true
    ),
    description: "Trans rights!",
    emoji: FishyEmojis.blahaj,
    weight: {
      min: 999,
      max: 999,
    },
    url: "https://en.wikipedia.org/wiki/Bl%C3%A5haj",
    traits: [FishyRegionTrait.Worldwide],
  }),
] satisfies Fishy[];
