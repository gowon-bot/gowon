import { FishyEmojiList } from "../../../lib/emoji/FishEmoji";
import { Fishy, FishyRarities } from "../Fishy";

export const superRareFishies = [
  new Fishy({
    id: "triplewart-seadevil",
    name: "Triplewart Seadevil",
    binomialName: "Cryptopsaras couesii",
    rarity: FishyRarities.SuperRare,
    description:
      "This fish can extend and contract the lure atatched to the front of its body.",
    emoji: FishyEmojiList.triplewartSeadevil,
    weight: {
      min: 3,
      max: 6,
    },
  }),

  new Fishy({
    id: "smooth-head-blobfish",
    name: "Smooth-head blobfish",
    binomialName: "Psychrolutes marcidus",
    rarity: FishyRarities.SuperRare,
    description: ":(",
    emoji: FishyEmojiList.smoothheadBlobfish,
    weight: {
      min: 9,
      max: 10,
    },
  }),

  new Fishy({
    id: "peppermint-angelfish",
    name: "Peppermint Angelfish",
    binomialName: "",
    rarity: FishyRarities.SuperRare,
    description: "A single peppermint angelfish once sold for 30,000 dollars!",
    emoji: FishyEmojiList.peppermintAngelfish,
    weight: {
      min: 0.7,
      max: 2,
    },
  }),

  new Fishy({
    id: "blackspotted-puffer",
    name: "Blackspotted Puffer",
    binomialName: "Arothron nigropunctatus",
    rarity: FishyRarities.SuperRare,
    description:
      "The Blackspotted Puffer holds the deadly poison tetrodotoxin, which protects it from predators.",
    emoji: FishyEmojiList.blackspottedPuffer,
    weight: {
      min: 2,
      max: 8,
    },
  }),

  new Fishy({
    id: "asian-sheepshead-wrasse",
    name: "Asian Sheepshead Wrasse",
    binomialName: "Semicossyphus reticulatus",
    rarity: FishyRarities.SuperRare,
    description:
      "This fish is a hermaphroditic species, meaning that it has both male and female organs, which allows it to change its sex. 🏳️‍⚧️",
    emoji: FishyEmojiList.asianSheepsheadWrasse,
    weight: {
      min: 5,
      max: 15,
    },
  }),

  new Fishy({
    id: "white-edged-lyretail",
    name: "White-edged Lyretail",
    binomialName: "Variola albimarginata",
    rarity: FishyRarities.SuperRare,
    description:
      "This fish is found either as a solitary fish or in small groups on the seaward edge of reefs",
    emoji: FishyEmojiList.whiteedgedLyretail,
    weight: {
      min: 4,
      max: 8,
    },
  }),
] satisfies Fishy[];
