import { FishyEmojiList } from "../../../lib/emoji/FishEmoji";
import { Fishy, FishyRarities } from "../classes/Fishy";

export const uncommonFishy = [
  new Fishy({
    id: "chinook-salmon",
    name: "Chinook Salmon",
    binomialName: "Oncorhynchus tshawytscha",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.chinookSalmon,
    description:
      "Chinook salmon possess a natural genetic color polymorphism, which gives their tissue and eggs either a red or white coloration.",
    weight: {
      min: 10,
      max: 12,
    },
  }),

  new Fishy({
    id: "yellow-tang",
    name: "Yellow Tang",
    binomialName: "Zebrasoma flavescens",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.yellowTang,
    description:
      "During the day these fish are bright yellow, however at night, their colour fades at night.",
    weight: {
      min: 4,
      max: 7,
    },
  }),

  new Fishy({
    id: "blue-tang",
    name: "Blue Tang",
    binomialName: "Paracanthurus hepatus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.blueTang,
    description:
      "Blue tangs are capable of adjusting the intensity of their hue from light blue to deep purple.",
    weight: {
      min: 0.9,
      max: 1.5,
    },
  }),

  new Fishy({
    id: "white-sturgeon",
    name: "White Sturgeon",
    binomialName: "Acipenser transmontanus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.whiteSturgeon,
    description: "White Sturgeon can live for over 100 years!",
    weight: {
      min: 20,
      max: 100,
    },
  }),

  new Fishy({
    id: "northern-puffer",
    name: "Northern Puffer",
    binomialName: "Sphoeroides maculatus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.northernPuffer,
    description:
      "Puffers puff up by inhaling air or water into a special chamber near the stomach",
    weight: {
      min: 0.7,
      max: 1.5,
    },
  }),

  new Fishy({
    id: "red-grouper",
    name: "Red Grouper",
    binomialName: "Epinephelus morio",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.redGrouper,
    description:
      "This fish actively excavates pits in the seafloor throughout their lifetime",
    weight: {
      min: 18,
      max: 25,
    },
  }),

  new Fishy({
    id: "humpback-grouper",
    name: "Humpback Grouper",
    binomialName: "Cromileptes altivelis",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.humpbackGrouper,
    description:
      "All Humpback Grouper are born female, and have the ability to change into males as they grow old",
    weight: {
      min: 18,
      max: 25,
    },
  }),

  new Fishy({
    id: "striped-raphael-catfish",
    name: "Striped Raphael Catfish",
    binomialName: "Platydoras armatulus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.stripedRaphaelCatfish,
    description:
      "This fish is a fine and sociable community fish that is peaceful to fellow catfishes and other fish species",
    weight: {
      min: 10,
      max: 15,
    },
  }),

  new Fishy({
    id: "poor-cod",
    name: "Poor Cod",
    binomialName: "Trisopterus minutus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.poorCod,
    description:
      "This fish is often seen as a menace for anglers, and has little commercial value",
    weight: {
      min: 8,
      max: 12,
    },
  }),
] satisfies Fishy[];
