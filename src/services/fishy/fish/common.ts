import { FishyEmojiList } from "../../../lib/emoji/FishyEmoji";
import { BaseFishy, FishyDisplayMode } from "../classes/BaseFishy";
import { Fishy, FishyRarities } from "../classes/Fishy";
import { GlovesFishy } from "../classes/GlovesFishy";
import { NetFishy } from "../classes/NetFishy";
import { FishyCategoryTrait } from "../traits/category";
import { FishyDepthTrait } from "../traits/depth";
import { FishyNameTrait } from "../traits/name";
import { FishyPhysicalTrait } from "../traits/physical";
import { FishyRegionTrait } from "../traits/region";

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
    url: "https://en.wikipedia.org/wiki/Rainbow_trout",
    traits: [
      FishyNameTrait.ColorInName,
      FishyNameTrait.AdjectiveInName,
      FishyCategoryTrait.Invasive,
      FishyCategoryTrait.Saltwater,
      FishyCategoryTrait.Freshwater,
      FishyRegionTrait.ArcticOcean,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(0, 10),
    ],
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
    url: "https://en.wikipedia.org/wiki/Chum_salmon",
    traits: [
      FishyRegionTrait.PacificOcean,
      FishyCategoryTrait.Saltwater,
      FishyCategoryTrait.Freshwater,
      new FishyDepthTrait(5, 50),
    ],
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
    url: "https://en.wikipedia.org/wiki/Walleye",
    traits: [
      FishyRegionTrait.NorthAmerica,
      FishyCategoryTrait.Perciform,
      FishyCategoryTrait.Freshwater,
      new FishyDepthTrait(0, 10),
    ],
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
    url: "https://en.wikipedia.org/wiki/Black_crappie",
    traits: [
      FishyNameTrait.ColorInName,
      FishyRegionTrait.NorthAmerica,
      FishyCategoryTrait.Freshwater,
      new FishyDepthTrait(0, 10),
    ],
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
    url: "https://en.wikipedia.org/wiki/Channel_catfish",
    traits: [
      FishyCategoryTrait.Invasive,
      FishyCategoryTrait.Freshwater,
      FishyRegionTrait.NorthAmerica,
      new FishyDepthTrait(0, 10),
    ],
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
    url: "https://en.wikipedia.org/wiki/Skipjack_tuna",
    traits: [
      FishyCategoryTrait.Perciform,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.PacificOcean,
      FishyRegionTrait.IndianOcean,
      new FishyDepthTrait(0, 250),
    ],
  }),

  new Fishy({
    id: "sea-goldie",
    name: "Sea Goldie",
    binomialName: "Pseudanthias squamipinnis",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.seaGoldie,
    description:
      "Each male will have a group of females around them, generally ranging from five to ten",
    weight: {
      min: 2,
      max: 3,
    },
    url: "https://en.wikipedia.org/wiki/Sea_goldie",
    traits: [
      FishyNameTrait.ColorInName,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Grouper,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.IndianOcean,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(0, 35),
    ],
  }),

  new Fishy({
    id: "atlantic-cod",
    name: "Atlantic Cod",
    binomialName: "Gadus morhua",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.atlanticCod,
    description:
      "Atlantic cod have been recorded to swim at speeds of a maximum of 21 to 54 cm/s",
    weight: {
      min: 30,
      max: 40,
    },
    url: "https://en.wikipedia.org/wiki/Atlantic_cod",
    traits: [
      FishyNameTrait.PlaceInName,
      FishyCategoryTrait.Cod,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.ArcticOcean,
      new FishyDepthTrait(50, 200),
    ],
  }),

  new NetFishy({
    id: "pink-shrimp",
    name: "Pink Shrimp",
    binomialName: "Pandalus borealis",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.pinkShrimp,
    description:
      "This shrimp's carapace is a source of a versatile chemical used for treating bleeding wounds, filtering wine and improving the soil in organic farming",
    weight: {
      min: 0.1,
      max: 2,
    },
    url: "https://en.wikipedia.org/wiki/Pandalus_borealis",
    traits: [
      FishyNameTrait.ColorInName,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Shrimp,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(20, 1300),
    ],
  }),

  new GlovesFishy({
    id: "dungeness-crab",
    name: "Dungeness Crab",
    binomialName: "Metacarcinus magister",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.dungenessCrab,
    description:
      "This species can be found as far north as the Aleutian Islands of Alaska, and as far south as Magdalena Bay in Baja California, Mexico",
    weight: {
      min: 0.5,
      max: 2,
    },
    url: "https://en.wikipedia.org/wiki/Dungeness_crab",
    traits: [
      FishyCategoryTrait.Crab,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(15, 55),
    ],
  }),

  new GlovesFishy({
    id: "blue-crab",
    name: "Blue Crab",
    binomialName: "Callinectes sapidus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.blueCrab,
    description: "The Blue Crab is the state crustacean of Maryland!",
    weight: {
      min: 0.1,
      max: 0.5,
    },
    url: "https://en.wikipedia.org/wiki/Callinectes_sapidus",
    traits: [
      FishyNameTrait.ColorInName,
      FishyPhysicalTrait.Blue,
      FishyRegionTrait.AtlanticOcean,
      FishyCategoryTrait.Saltwater,
      FishyCategoryTrait.Crab,
      new FishyDepthTrait(0, 90),
    ],
  }),

  new GlovesFishy({
    id: "american-lobster",
    name: "American Lobster",
    binomialName: "Homarus americanus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.americanLobster,
    description:
      "American lobsters can be blue, red, yellow, orange, white, or even split coloured!",
    weight: {
      min: 0.5,
      max: 4,
    },
    url: "https://en.wikipedia.org/wiki/American_lobster",
    traits: [
      FishyNameTrait.PlaceInName,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Lobster,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(4, 100),
    ],
  }),

  new GlovesFishy({
    id: "purple-sea-urchin",
    name: "Purple Sea Urchin",
    binomialName: "Strongylocentrotus purpuratus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.purpleSeaUrchin,
    description:
      "The genome of this species was completely sequenced and annotated in 2006",
    weight: {
      min: 0.1,
      max: 0.3,
    },
    displayMode: FishyDisplayMode.Bottom,
    url: "https://en.wikipedia.org/wiki/Strongylocentrotus_purpuratus",
    traits: [
      FishyNameTrait.ColorInName,
      FishyPhysicalTrait.Purple,
      FishyCategoryTrait.Urchin,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(0, 90),
    ],
  }),
] satisfies BaseFishy[];
