import { FishyEmojis } from "../../../lib/emoji/FishyEmoji";
import { Fishy, Level1Fishy, Level2Fishy, Level3Fishy } from "../Fishy";
import { FishyRarities } from "../rarity";
import { FishyCategoryTrait } from "../traits/category";
import { FishyDepthTrait } from "../traits/depth";
import { FishyNameTrait } from "../traits/name";
import { FishyPhysicalTrait } from "../traits/physical";
import { FishyRegionTrait } from "../traits/region";

export const rareFishies = [
  new Level1Fishy({
    id: "blue-betta",
    name: "Blue Betta",
    binomialName: "Betta smaragdina",
    rarity: FishyRarities.Rare,
    description:
      "The species gets its blue colours due to refraction and interference of light that results from hexagonal crystals that are less than 0.5 micrometres",
    emoji: FishyEmojis.blueBetta,
    weight: {
      min: 0.1,
      max: 0.2,
    },
    url: "https://en.wikipedia.org/wiki/Betta_smaragdina",
    traits: [
      FishyNameTrait.ColorInName,
      FishyPhysicalTrait.Blue,
      FishyRegionTrait.Asia,
      FishyCategoryTrait.Freshwater,
      new FishyDepthTrait(0, 5),
    ],
  }),

  new Level1Fishy({
    id: "orange-clownfish",
    name: "Orange Clownfish",
    binomialName: "Amphiprion percula",
    rarity: FishyRarities.Rare,
    description:
      "This fish hides from predators in sea anenome's stinging tentacles, which it is immune to",
    emoji: FishyEmojis.clownfish,
    weight: {
      min: 1,
      max: 3,
    },
    url: "https://en.wikipedia.org/wiki/Orange_clownfish",
    traits: [
      FishyNameTrait.ColorInName,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Saltwater,
      FishyPhysicalTrait.Striped,
      FishyRegionTrait.IndianOcean,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(2, 10),
    ],
  }),

  new Level1Fishy({
    id: "yellow-boxfish",
    name: "Yellow Boxfish",
    binomialName: "Ostracion cubicum",
    rarity: FishyRarities.Rare,
    description:
      "Boxfish are known for their armored and rigid body, which is adapted to its style of swimming",
    emoji: FishyEmojis.yellowBoxfish,
    weight: {
      min: 1,
      max: 3,
    },
    url: "https://en.wikipedia.org/wiki/Yellow_boxfish",
    traits: [
      FishyNameTrait.ColorInName,
      FishyPhysicalTrait.Spotted,
      FishyPhysicalTrait.Yellow,
      FishyRegionTrait.PacificOcean,
      FishyRegionTrait.IndianOcean,
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.MediterraneanSea,
      FishyCategoryTrait.Saltwater,
      new FishyDepthTrait(1, 40),
    ],
  }),

  new Level1Fishy({
    id: "banded-rainbowfish",
    name: "Banded Rainbowfish",
    binomialName: "Melanotaenia trifasciata",
    rarity: FishyRarities.Rare,
    description:
      "Males compete with one another for territory and female attention in contests where they compare body coloration and size",
    emoji: FishyEmojis.bandedRainbowfish,
    weight: {
      min: 0.5,
      max: 2,
    },
    url: "https://en.wikipedia.org/wiki/Banded_rainbowfish",
    traits: [
      FishyNameTrait.ColorInName,
      FishyNameTrait.AdjectiveInName,
      FishyCategoryTrait.Freshwater,
      FishyRegionTrait.Oceania,
      new FishyDepthTrait(0, 20),
    ],
  }),

  new Level1Fishy({
    id: "yellow-tail-acei",
    name: "Yellow-tail Acei",
    binomialName: 'Pseudotropheus sp. "acei"',
    rarity: FishyRarities.Rare,
    description:
      "This fish can only be found naturally in Lake Malawi, however it is a popular fish for fish-keepers",
    emoji: FishyEmojis.yellowtailAcei,
    weight: {
      min: 0.3,
      max: 1.7,
    },
    url: "https://en.wikipedia.org/wiki/Pseudotropheus_sp._%22acei%22",
    traits: [
      FishyNameTrait.ColorInName,
      FishyRegionTrait.Africa,
      FishyCategoryTrait.Freshwater,
      new FishyDepthTrait(5, 20),
    ],
  }),

  new Level1Fishy({
    id: "spanish-flag",
    name: "Spanish Flag",
    binomialName: "Gonioplectrus hispanus",
    rarity: FishyRarities.Rare,
    description: "Not to be confused with the Spanish flag",
    emoji: FishyEmojis.spanishFlag,
    weight: {
      min: 4,
      max: 7,
    },
    url: "https://en.wikipedia.org/wiki/Spanish_flag_(fish)",
    traits: [
      FishyNameTrait.PlaceInName,
      FishyPhysicalTrait.Striped,
      FishyPhysicalTrait.Yellow,
      FishyCategoryTrait.Grouper,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(35, 460),
    ],
  }),

  new Level1Fishy({
    id: "goldenstriped-soapfish",
    name: "Goldenstriped Soapfish",
    binomialName: "Grammistes sexlineatus",
    rarity: FishyRarities.Rare,
    description:
      "The secretions from the skin of soapfish resemble lathered soap, and are the basis for the name.",
    emoji: FishyEmojis.goldenstripedSoapfish,
    weight: {
      min: 3,
      max: 6,
    },
    url: "https://en.wikipedia.org/wiki/Goldenstriped_soapfish",
    traits: [
      FishyNameTrait.ColorInName,
      FishyNameTrait.AdjectiveInName,
      FishyCategoryTrait.Grouper,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.IndianOcean,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(2, 40),
    ],
  }),

  new Level2Fishy({
    id: "blue-bolt-shrimp",
    name: "Blue Bolt Shrimp",
    binomialName: "Caridina cantonensis",
    rarity: FishyRarities.Rare,
    emoji: FishyEmojis.blueBoltShrimp,
    description:
      "This shrimp is a blue variant of the Bee Shrimp, named after its brilliant blue colour.",
    weight: {
      min: 0.1,
      max: 1,
    },
    url: "https://en.wikipedia.org/wiki/Bee_shrimp",
    traits: [
      FishyNameTrait.ColorInName,
      FishyPhysicalTrait.Blue,
      FishyRegionTrait.Asia,
      FishyCategoryTrait.Shrimp,
      FishyCategoryTrait.Freshwater,
      new FishyDepthTrait(0, 15),
    ],
  }),

  new Level2Fishy({
    id: "cardinal-shrimp",
    name: "Cardinal Shrimp",
    binomialName: "Caridina dennerli",
    rarity: FishyRarities.Rare,
    emoji: FishyEmojis.cardinalShrimp,
    description:
      "No Caridina dennerli have been recorded in the wild since 2013, and the species possibly is extinct in the wild. However, it is still kept and bred in captivity.",
    weight: {
      min: 0.1,
      max: 1,
    },
    url: "https://en.wikipedia.org/wiki/Caridina_dennerli",
    traits: [
      FishyPhysicalTrait.Spotted,
      FishyPhysicalTrait.Red,
      FishyRegionTrait.Asia,
      FishyCategoryTrait.Shrimp,
      FishyCategoryTrait.Freshwater,
      new FishyDepthTrait(10, 30),
    ],
  }),

  new Level2Fishy({
    id: "big-belly-seahorse",
    name: "Big-belly Seahorse",
    binomialName: "Hippocampus abdominalis",
    rarity: FishyRarities.Rare,
    emoji: FishyEmojis.bigbellySeahorse,
    description:
      "Each this species' eyes can move independently, allowing it to more easily see predators",
    weight: {
      min: 0.1,
      max: 1,
    },
    url: "https://en.wikipedia.org/wiki/Big-belly_seahorse",
    traits: [
      FishyNameTrait.AdjectiveInName,
      FishyPhysicalTrait.Spotted,
      FishyPhysicalTrait.Yellow,
      FishyRegionTrait.PacificOcean,
      FishyCategoryTrait.Seahorse,
      FishyCategoryTrait.Saltwater,
      new FishyDepthTrait(5, 50),
    ],
  }),

  new Level3Fishy({
    id: "sleepy-crab",
    name: "Sleepy Crab",
    binomialName: "Dromia dormia",
    rarity: FishyRarities.Rare,
    emoji: FishyEmojis.sleepyCrab,
    description:
      "This species of crab carries a sponge on its back, earning it the nickname of Sponge Crab",
    weight: {
      min: 0.4,
      max: 1.5,
    },
    url: "https://en.wikipedia.org/wiki/Dromia_personata",
    traits: [
      FishyNameTrait.AdjectiveInName,
      FishyCategoryTrait.Crab,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.MediterraneanSea,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(5, 100),
    ],
  }),

  new Level3Fishy({
    id: "golden-king-crab",
    name: "Golden King Crab",
    binomialName: "Lithodes aequispinus",
    rarity: FishyRarities.Rare,
    emoji: FishyEmojis.goldenKingCrab,
    description: "This crab uses its strong sense of smell to seek out food",
    weight: {
      min: 3,
      max: 5,
    },
    url: "https://en.wikipedia.org/wiki/Lithodes_aequispinus",
    traits: [
      FishyNameTrait.ColorInName,
      FishyNameTrait.AdjectiveInName,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Crab,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.PacificOcean,
      FishyRegionTrait.ArcticOcean,
      new FishyDepthTrait(300, 1000),
    ],
  }),

  new Level3Fishy({
    id: "patagonian-lobsterette",
    name: "Patagonian Lobsterette",
    binomialName: "Thymops birsteini",
    rarity: FishyRarities.Rare,
    emoji: FishyEmojis.patagonianLobsterette,
    description:
      "This species seems to prefer muddy bottoms, and has been observed entering and exiting burrows",
    weight: {
      min: 0.1,
      max: 1,
    },
    url: "https://en.wikipedia.org/wiki/Thymops",
    traits: [
      FishyNameTrait.AdjectiveInName,
      FishyNameTrait.PlaceInName,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Lobster,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(120, 1500),
    ],
  }),
] satisfies Fishy[];
