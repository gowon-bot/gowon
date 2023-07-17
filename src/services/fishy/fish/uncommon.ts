import { FishyEmojis } from "../../../lib/emoji/FishyEmoji";
import {
  Fishy,
  FishyDisplayMode,
  Level1Fishy,
  Level2Fishy,
  Level3Fishy,
} from "../Fishy";
import { FishyRarities } from "../rarity";
import { FishyCategoryTrait } from "../traits/category";
import { FishyDepthTrait } from "../traits/depth";
import { FishyNameTrait } from "../traits/name";
import { FishyPhysicalTrait } from "../traits/physical";
import { FishyRegionTrait } from "../traits/region";

export const uncommonFishy = [
  new Level1Fishy({
    id: "chinook-salmon",
    name: "Chinook Salmon",
    binomialName: "Oncorhynchus tshawytscha",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.chinookSalmon,
    description:
      "Chinook salmon possess a natural genetic color polymorphism, which gives their tissue and eggs either a red or white coloration.",
    weight: {
      min: 10,
      max: 12,
    },
    url: "https://en.wikipedia.org/wiki/Chinook_salmon",
    traits: [
      FishyCategoryTrait.Freshwater,
      FishyPhysicalTrait.Red,
      FishyRegionTrait.NorthAmerica,
      FishyRegionTrait.ArcticOcean,
      new FishyDepthTrait(5, 35),
    ],
  }),

  new Level1Fishy({
    id: "yellow-tang",
    name: "Yellow Tang",
    binomialName: "Zebrasoma flavescens",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.yellowTang,
    description:
      "During the day these fish are bright yellow, however at night, their colour fades at night.",
    weight: {
      min: 4,
      max: 7,
    },
    url: "https://en.wikipedia.org/wiki/Yellow_tang",
    traits: [
      FishyNameTrait.ColorInName,
      FishyPhysicalTrait.Yellow,
      FishyCategoryTrait.Surgeonfish,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(2, 50),
    ],
  }),

  new Level1Fishy({
    id: "blue-tang",
    name: "Blue Tang",
    binomialName: "Paracanthurus hepatus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.blueTang,
    description:
      "Blue tangs are capable of adjusting the intensity of their hue from light blue to deep purple.",
    weight: {
      min: 0.9,
      max: 1.5,
    },
    url: "https://en.wikipedia.org/wiki/Paracanthurus",
    traits: [
      FishyNameTrait.ColorInName,
      FishyPhysicalTrait.Blue,
      FishyRegionTrait.PacificOcean,
      FishyCategoryTrait.Saltwater,
      FishyCategoryTrait.Surgeonfish,
      new FishyDepthTrait(2, 40),
    ],
  }),

  new Level1Fishy({
    id: "white-sturgeon",
    name: "White Sturgeon",
    binomialName: "Acipenser transmontanus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.whiteSturgeon,
    description: "White Sturgeon can live for over 100 years!",
    weight: {
      min: 20,
      max: 100,
    },
    url: "https://en.wikipedia.org/wiki/White_sturgeon",
    traits: [
      FishyNameTrait.ColorInName,
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.PacificOcean,
      FishyCategoryTrait.Freshwater,
      FishyCategoryTrait.Saltwater,
      new FishyDepthTrait(2, 25),
    ],
  }),

  new Level1Fishy({
    id: "northern-puffer",
    name: "Northern Puffer",
    binomialName: "Sphoeroides maculatus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.northernPuffer,
    description:
      "Puffers puff up by inhaling air or water into a special chamber near the stomach",
    weight: {
      min: 0.7,
      max: 1.5,
    },
    url: "https://en.wikipedia.org/wiki/Northern_puffer",
    traits: [
      FishyPhysicalTrait.Spotted,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(10, 180),
    ],
  }),

  new Level1Fishy({
    id: "red-grouper",
    name: "Red Grouper",
    binomialName: "Epinephelus morio",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.redGrouper,
    description:
      "This fish actively excavates pits in the seafloor throughout their lifetime",
    weight: {
      min: 18,
      max: 25,
    },
    url: "https://en.wikipedia.org/wiki/Red_grouper",
    traits: [
      FishyNameTrait.ColorInName,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Grouper,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(5, 330),
    ],
  }),

  new Level1Fishy({
    id: "humpback-grouper",
    name: "Humpback Grouper",
    binomialName: "Cromileptes altivelis",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.humpbackGrouper,
    description:
      "All Humpback Grouper are born female, and have the ability to change into males as they grow old",
    weight: {
      min: 18,
      max: 25,
    },
    url: "https://en.wikipedia.org/wiki/Humpback_grouper",
    traits: [
      FishyPhysicalTrait.Spotted,
      FishyRegionTrait.PacificOcean,
      FishyCategoryTrait.Saltwater,
      FishyCategoryTrait.Grouper,
      new FishyDepthTrait(2, 40),
    ],
  }),

  new Level1Fishy({
    id: "striped-raphael-catfish",
    name: "Striped Raphael Catfish",
    binomialName: "Platydoras armatulus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.stripedRaphaelCatfish,
    description:
      "This fish is a fine and sociable community fish that is peaceful to fellow catfishes and other fish species",
    weight: {
      min: 10,
      max: 15,
    },
    url: "https://en.wikipedia.org/wiki/Striped_Raphael_catfish",
    traits: [
      FishyCategoryTrait.Freshwater,
      FishyNameTrait.AdjectiveInName,
      FishyPhysicalTrait.Striped,
      FishyRegionTrait.SouthAmerica,
      new FishyDepthTrait(0, 10),
    ],
  }),

  new Level1Fishy({
    id: "poor-cod",
    name: "Poor Cod",
    binomialName: "Trisopterus minutus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.poorCod,
    description:
      "This fish is often seen as a menace for anglers, and has little commercial value",
    weight: {
      min: 8,
      max: 12,
    },
    url: "https://en.wikipedia.org/wiki/Poor_cod",
    traits: [
      FishyNameTrait.AdjectiveInName,
      FishyRegionTrait.AtlanticOcean,
      FishyCategoryTrait.Cod,
      FishyCategoryTrait.Saltwater,
      new FishyDepthTrait(15, 200),
    ],
  }),

  new Level2Fishy({
    id: "black-tiger-shrimp",
    name: "Black Tiger Shrimp",
    binomialName: "Penaeus monodon",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.blackTigerShrimp,
    description:
      "This specicies is the second-most widely cultured prawn species in the world",
    weight: {
      min: 1,
      max: 3,
    },
    url: "https://en.wikipedia.org/wiki/Penaeus_monodon",
    traits: [
      FishyNameTrait.ColorInName,
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.PacificOcean,
      FishyRegionTrait.IndianOcean,
      FishyCategoryTrait.Invasive,
      FishyCategoryTrait.Shrimp,
      FishyCategoryTrait.Saltwater,
      new FishyDepthTrait(0, 110),
    ],
  }),

  new Level2Fishy({
    id: "snowball-shrimp",
    name: "Snowball Shrimp",
    binomialName: "Neocaridina zhangjiajiensis",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.snowballShrimp,
    description: "The eggs in this transluscent shrimp look like snowballs!",
    weight: {
      min: 0.1,
      max: 1,
    },
    url: "https://en.wikipedia.org/wiki/Neocaridina_zhangjiajiensis",
    traits: [
      FishyCategoryTrait.Shrimp,
      FishyCategoryTrait.Freshwater,
      new FishyDepthTrait(0, 30),
    ],
  }),

  new Level2Fishy({
    id: "common-seahorse",
    name: "Common Seahorse",
    binomialName: "Hippocampus kuda",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.commonSeahorse,
    description:
      "This species is extremely valuable to the traditional Chinese medicine trade, where it has been said to regulate nervous, reproductive, endocrine, and immune systems",
    weight: {
      min: 0.2,
      max: 0.5,
    },
    url: "https://en.wikipedia.org/wiki/Hippocampus_kuda",
    traits: [
      FishyNameTrait.AdjectiveInName,
      FishyPhysicalTrait.Yellow,
      FishyCategoryTrait.Seahorse,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.IndianOcean,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(5, 55),
    ],
  }),

  new Level2Fishy({
    id: "lined-seahorse",
    name: "Lined Seahorse",
    binomialName: "Hippocampus erectus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.linedSeahorse,
    description: "Lined Seahorse are monogamous, meaning they mate for life!",
    weight: {
      min: 0.2,
      max: 0.5,
    },
    url: "https://en.wikipedia.org/wiki/Lined_seahorse",
    traits: [
      FishyNameTrait.AdjectiveInName,
      FishyCategoryTrait.Seahorse,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(5, 75),
    ],
  }),

  new Level3Fishy({
    id: "florida-stone-crab",
    name: "Florida Stone Crab",
    binomialName: "Menippe mercenaria",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.floridaStoneCrab,
    description:
      "This crab can lose its limbs easily to escape from predators or tight spaces, but don't worry their limbs can grow back!",
    weight: {
      min: 0.2,
      max: 0.5,
    },
    url: "https://en.wikipedia.org/wiki/Florida_stone_crab",
    traits: [
      FishyNameTrait.PlaceInName,
      FishyCategoryTrait.Crab,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(5, 60),
    ],
  }),

  new Level3Fishy({
    id: "european-lobster",
    name: "European Lobster",
    binomialName: "Homarus gammarus",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.europeanLobster,
    description:
      "In this species, the right claw is the crusher and the left claw is the cutter",
    weight: {
      min: 1,
      max: 10,
    },
    url: "https://en.wikipedia.org/wiki/Homarus_gammarus",
    traits: [
      FishyNameTrait.PlaceInName,
      FishyPhysicalTrait.Red,
      FishyPhysicalTrait.Blue,
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.MediterraneanSea,
      FishyCategoryTrait.Saltwater,
      FishyCategoryTrait.Lobster,
      new FishyDepthTrait(0, 150),
    ],
  }),

  new Level3Fishy({
    id: "long-spine-slate-pen-sea-urchin",
    name: "Long-spine Slate Pen Sea Urchin",
    binomialName: "Cidaris cidaris",
    rarity: FishyRarities.Uncommon,
    emoji: FishyEmojis.longSpineSlatePenSeaUrchin,
    description:
      "This sea urchin often has bits of algae, sponge or other organisms adhering to the spines",
    weight: {
      min: 0.2,
      max: 0.5,
    },
    url: "https://en.wikipedia.org/wiki/Cidaris_cidaris",
    displayMode: FishyDisplayMode.Bottom,
    traits: [
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.MediterraneanSea,
      FishyCategoryTrait.Urchin,
      FishyCategoryTrait.Saltwater,
      new FishyDepthTrait(50, 1800),
    ],
  }),
] satisfies Fishy[];
