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

export const commonFishies = [
  new Level1Fishy({
    id: "rainbow-trout",
    name: "Rainbow Trout",
    binomialName: "Oncorhynchus mykiss",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.rainbowTrout,
    description:
      "A species of trout native to cold-water tributaries of the Pacific Ocean in Asia and North America",
    weight: {
      min: 0.5,
      max: 2.5,
    },
    url: "https://en.wikipedia.org/wiki/Rainbow_trout",
    traits: [
      FishyNameTrait.Color,
      FishyNameTrait.Adjective,
      FishyCategoryTrait.Invasive,
      FishyCategoryTrait.Saltwater,
      FishyCategoryTrait.Freshwater,
      FishyRegionTrait.ArcticOcean,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(0, 10),
    ],
  }),

  new Level1Fishy({
    id: "chum-salmon",
    name: "Chum Salmon",
    binomialName: "Oncorhynchus keta",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.chumSalmon,
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

  new Level1Fishy({
    id: "walleye",
    name: "Walleye",
    binomialName: "Sander vitreus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.walleye,
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

  new Level1Fishy({
    id: "black-crappie",
    name: "Black Crappie",
    binomialName: "Pomoxis nigromaculatus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.blackCrappie,
    description:
      "Black crappies are unusual among freshwater fish for their schooling behaviour.",
    weight: {
      min: 1,
      max: 7,
    },
    url: "https://en.wikipedia.org/wiki/Black_crappie",
    traits: [
      FishyNameTrait.Color,
      FishyRegionTrait.NorthAmerica,
      FishyCategoryTrait.Freshwater,
      new FishyDepthTrait(0, 10),
    ],
  }),

  new Level1Fishy({
    id: "channel-catfish",
    name: "Channel Catfish",
    binomialName: "Ictalurus punctatus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.channelCatfish,
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

  new Level1Fishy({
    id: "skipjack-tuna",
    name: "Skipjack Tuna",
    binomialName: "Katsuwonus pelamis",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.skipjackTuna,
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

  new Level1Fishy({
    id: "sea-goldie",
    name: "Sea Goldie",
    binomialName: "Pseudanthias squamipinnis",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.seaGoldie,
    description:
      "Each male will have a group of females around them, generally ranging from five to ten",
    weight: {
      min: 2,
      max: 3,
    },
    url: "https://en.wikipedia.org/wiki/Sea_goldie",
    traits: [
      FishyNameTrait.Color,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Grouper,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.IndianOcean,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(0, 35),
    ],
  }),

  new Level1Fishy({
    id: "atlantic-cod",
    name: "Atlantic Cod",
    binomialName: "Gadus morhua",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.atlanticCod,
    description:
      "Atlantic cod have been recorded to swim at speeds of a maximum of 21 to 54 cm/s",
    weight: {
      min: 30,
      max: 40,
    },
    url: "https://en.wikipedia.org/wiki/Atlantic_cod",
    traits: [
      FishyNameTrait.Place,
      FishyCategoryTrait.Cod,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.ArcticOcean,
      new FishyDepthTrait(50, 200),
    ],
  }),

  new Level2Fishy({
    id: "pink-shrimp",
    name: "Pink Shrimp",
    binomialName: "Pandalus borealis",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.pinkShrimp,
    description:
      "This shrimp's carapace is a source of a versatile chemical used for treating bleeding wounds, filtering wine and improving the soil in organic farming",
    weight: {
      min: 0.1,
      max: 2,
    },
    url: "https://en.wikipedia.org/wiki/Pandalus_borealis",
    traits: [
      FishyNameTrait.Color,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Shrimp,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(20, 1300),
    ],
  }),

  new Level3Fishy({
    id: "dungeness-crab",
    name: "Dungeness Crab",
    binomialName: "Metacarcinus magister",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.dungenessCrab,
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

  new Level3Fishy({
    id: "blue-crab",
    name: "Blue Crab",
    binomialName: "Callinectes sapidus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.blueCrab,
    description: "The Blue Crab is the state crustacean of Maryland!",
    weight: {
      min: 0.1,
      max: 0.5,
    },
    url: "https://en.wikipedia.org/wiki/Callinectes_sapidus",
    traits: [
      FishyNameTrait.Color,
      FishyPhysicalTrait.Blue,
      FishyRegionTrait.AtlanticOcean,
      FishyCategoryTrait.Saltwater,
      FishyCategoryTrait.Crab,
      new FishyDepthTrait(0, 90),
    ],
  }),

  new Level3Fishy({
    id: "american-lobster",
    name: "American Lobster",
    binomialName: "Homarus americanus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.americanLobster,
    description:
      "American lobsters can be blue, red, yellow, orange, white, or even split coloured!",
    weight: {
      min: 0.5,
      max: 4,
    },
    url: "https://en.wikipedia.org/wiki/American_lobster",
    traits: [
      FishyNameTrait.Place,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Lobster,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(4, 100),
    ],
  }),

  new Level3Fishy({
    id: "purple-sea-urchin",
    name: "Purple Sea Urchin",
    binomialName: "Strongylocentrotus purpuratus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojis.purpleSeaUrchin,
    description:
      "The genome of this species was completely sequenced and annotated in 2006",
    weight: {
      min: 0.1,
      max: 0.3,
    },
    displayMode: FishyDisplayMode.Bottom,
    url: "https://en.wikipedia.org/wiki/Strongylocentrotus_purpuratus",
    traits: [
      FishyNameTrait.Color,
      FishyPhysicalTrait.Purple,
      FishyCategoryTrait.Urchin,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(0, 90),
    ],
  }),
] satisfies Fishy[];
