import { FishyEmojiList } from "../../../lib/emoji/FishEmoji";
import { Fishy, FishyRarities } from "../Fishy";

export const superRareFishies = [
  new Fishy({
    id: "triplewart-seadevil",
    name: "Triplewart Seadevil",
    binomialName: "Cryptopsaras couesii",
    rarity: FishyRarities.SuperRare,
    description:
      "This fish can extend and contract the lure atatched to the front of its body",
    emoji: FishyEmojiList.tripleWartSeadevil,
    weight: {
      min: 1.1,
      max: 3,
    },
  }),
  new Fishy({
    id: "smooth-head-blobfish",
    name: "Smooth-head blobfish",
    binomialName: "Psychrolutes marcidus",
    rarity: FishyRarities.SuperRare,
    description: ":(",
    emoji: FishyEmojiList.smoothHeadBlobfish,
    weight: {
      min: 9,
      max: 10,
    },
  }),
] satisfies Fishy[];
