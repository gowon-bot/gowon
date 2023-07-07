import { FishyEmojiList } from "../../../lib/emoji/FishyEmoji";
import { BaseFishy, FishyDisplayMode } from "../classes/BaseFishy";
import { Fishy, FishyRarities } from "../classes/Fishy";
import { GlovesFishy } from "../classes/GlovesFishy";
import { NetFishy } from "../classes/NetFishy";

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

  new NetFishy({
    id: "black-tiger-shrimp",
    name: "Black Tiger Shrimp",
    binomialName: "Penaeus monodon",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.blackTigerShrimp,
    description:
      "This specicies is the second-most widely cultured prawn species in the world",
    weight: {
      min: 1,
      max: 3,
    },
  }),

  new NetFishy({
    id: "snowball-shrimp",
    name: "Snowball Shrimp",
    binomialName: "Neocaridina zhangjiajiensis",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.snowballShrimp,
    description: "The eggs in this transluscent shrimp look like snowballs!",
    weight: {
      min: 0.1,
      max: 1,
    },
  }),

  new NetFishy({
    id: "common-seahorse",
    name: "Common Seahorse",
    binomialName: "Hippocampus kuda",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.commonSeahorse,
    description:
      "This species is extremely valuable to the traditional Chinese medicine trade, where it has been said to regulate nervous, reproductive, endocrine, and immune systems",
    weight: {
      min: 0.2,
      max: 0.5,
    },
  }),

  new NetFishy({
    id: "lined-seahorse",
    name: "Lined Seahorse",
    binomialName: "Hippocampus erectus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.linedSeahorse,
    description: "Lined Seahorse are monogamous, meaning they mate for life!",
    weight: {
      min: 0.2,
      max: 0.5,
    },
  }),

  new GlovesFishy({
    id: "florida-stone-crab",
    name: "Florida Stone Crab",
    binomialName: "Menippe mercenaria",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.floridaStoneCrab,
    description:
      "This crab can lose its limbs easily to escape from predators or tight spaces, but don't worry their limbs can grow back!",
    weight: {
      min: 0.2,
      max: 0.5,
    },
  }),

  new GlovesFishy({
    id: "european-lobster",
    name: "European Lobster",
    binomialName: "Homarus gammarus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.europeanLobster,
    description:
      "In this species, the right claw is the crusher and the left claw is the cutter",
    weight: {
      min: 1,
      max: 10,
    },
  }),

  new GlovesFishy({
    id: "long-spine-slate-pen-sea-urchin",
    name: "Long-spine Slate Pen Sea Urchin",
    binomialName: "Cidaris cidaris",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojiList.longSpineSlatePenSeaUrchin,
    description:
      "This sea urchin often has bits of algae, sponge or other organisms adhering to the spines",
    weight: {
      min: 0.2,
      max: 0.5,
    },
    displayMode: FishyDisplayMode.Bottom,
  }),
] satisfies BaseFishy[];
