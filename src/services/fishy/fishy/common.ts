import { FishyEmojiList } from "../../../lib/emoji/FishEmoji";
import { Fishy, FishyRarities } from "../Fishy";

export const commonFishies = [
  new Fishy({
    id: "rainbow-trout",
    name: "Rainbow Trout",
    binomialName: "Oncorhynchus mykiss",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.rainbowTrout,
    description:
      "A species of trout native to cold-water tributaries of the Pacific Ocean in Asia and North America",
    weight: {
      min: 0.5,
      max: 2.5,
    },
  }),

  new Fishy({
    id: "chum-salmon",
    name: "Chum Salmon",
    binomialName: "Oncorhynchus keta",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.chumSalmon,
    description:
      'The English name "chum salmon" comes from the Chinook Jargon term tzum, meaning "spotted" or "marked"',
    weight: {
      min: 4.4,
      max: 10,
    },
  }),

  new Fishy({
    id: "walleye",
    name: "Walleye",
    binomialName: "Sander vitreus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.walleye,
    description: "Walleyes have thousands of taste buds in their lips!",
    weight: {
      min: 5,
      max: 9,
    },
  }),

  new Fishy({
    id: "black-crappie",
    name: "Black Crappie",
    binomialName: "Pomoxis nigromaculatus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.blackCrappie,
    description:
      "Black crappies are unusual among freshwater fish for their schooling behaviour.",
    weight: {
      min: 1,
      max: 7,
    },
  }),

  new Fishy({
    id: "channel-catfish",
    name: "Channel Catfish",
    binomialName: "Ictalurus punctatus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.channelCatfish,
    description: "This fish is legally an invasive species in many countries!",
    weight: {
      min: 3,
      max: 8,
    },
  }),

  new Fishy({
    id: "skipjack-tuna",
    name: "Skipjack Tuna",
    binomialName: "Katsuwonus pelamis",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.skipjackTuna,
    description:
      "This species has the highest percentage of skeletal muscle devoted to locomotion of all animals, with 68% of the animal's total body mass",
    weight: {
      min: 8,
      max: 10,
    },
  }),
] satisfies Fishy[];
