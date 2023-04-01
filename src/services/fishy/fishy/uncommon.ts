import { FishyEmojiList } from "../../../lib/emoji/FishEmoji";
import { Fishy, FishyRarities } from "../Fishy";

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
] satisfies Fishy[];
