import { FishyEmojis } from "../../../lib/emoji/FishyEmoji";
import { Fishy, Level1Fishy, Level2Fishy, Level3Fishy } from "../Fishy";
import { FishyRarities } from "../rarity";
import { FishyCategoryTrait } from "../traits/category";
import { FishyDepthTrait } from "../traits/depth";
import { FishyNameTrait } from "../traits/name";
import { FishyPhysicalTrait } from "../traits/physical";
import { FishyRegionTrait } from "../traits/region";

export const superRareFishies = [
  new Level1Fishy({
    id: "triplewart-seadevil",
    name: "Triplewart Seadevil",
    binomialName: "Cryptopsaras couesii",
    rarity: FishyRarities.SuperRare,
    description:
      "This fish can extend and contract the lure atatched to the front of its body.",
    emoji: FishyEmojis.triplewartSeadevil,
    weight: {
      min: 3,
      max: 6,
    },
    url: "https://en.wikipedia.org/wiki/Triplewart_seadevil",
    traits: [
      FishyRegionTrait.IndianOcean,
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.PacificOcean,
      FishyRegionTrait.ArcticOcean,
      FishyCategoryTrait.Saltwater,
      new FishyDepthTrait(150, 4000),
    ],
  }),

  new Level1Fishy({
    id: "smooth-head-blobfish",
    name: "Smooth-head blobfish",
    binomialName: "Psychrolutes marcidus",
    rarity: FishyRarities.SuperRare,
    description: ":(",
    emoji: FishyEmojis.smoothheadBlobfish,
    weight: {
      min: 9,
      max: 10,
    },
    url: "https://en.wikipedia.org/wiki/Psychrolutes_marcidus",
    traits: [
      FishyRegionTrait.PacificOcean,
      FishyCategoryTrait.Saltwater,
      new FishyDepthTrait(600, 1200),
    ],
  }),

  new Level1Fishy({
    id: "peppermint-angelfish",
    name: "Peppermint Angelfish",
    binomialName: "Centropyge boylei",
    rarity: FishyRarities.SuperRare,
    description: "A single peppermint angelfish once sold for 30,000 dollars!",
    emoji: FishyEmojis.peppermintAngelfish,
    weight: {
      min: 0.7,
      max: 2,
    },
    url: "https://en.wikipedia.org/wiki/Peppermint_angelfish",
    traits: [
      FishyNameTrait.Color,
      FishyPhysicalTrait.Striped,
      FishyPhysicalTrait.Red,
      FishyRegionTrait.PacificOcean,
      FishyCategoryTrait.Perciform,
      FishyCategoryTrait.Saltwater,
      new FishyDepthTrait(55, 120),
    ],
  }),

  new Level1Fishy({
    id: "blackspotted-puffer",
    name: "Blackspotted Puffer",
    binomialName: "Arothron nigropunctatus",
    rarity: FishyRarities.SuperRare,
    description:
      "The Blackspotted Puffer holds the deadly poison tetrodotoxin, which protects it from predators.",
    emoji: FishyEmojis.blackspottedPuffer,
    weight: {
      min: 2,
      max: 8,
    },
    url: "https://en.wikipedia.org/wiki/Blackspotted_puffer",
    traits: [
      FishyNameTrait.Color,
      FishyNameTrait.Adjective,
      FishyPhysicalTrait.Spotted,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.IndianOcean,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(0, 25),
    ],
  }),

  new Level1Fishy({
    id: "asian-sheepshead-wrasse",
    name: "Asian Sheepshead Wrasse",
    binomialName: "Semicossyphus reticulatus",
    rarity: FishyRarities.SuperRare,
    description:
      "This fish is a hermaphroditic species, meaning that it has both male and female organs, which allows it to change its sex. 🏳️‍⚧️",
    emoji: FishyEmojis.asianSheepsheadWrasse,
    weight: {
      min: 5,
      max: 15,
    },
    url: "https://en.wikipedia.org/wiki/Asian_sheepshead_wrasse",
    traits: [
      FishyNameTrait.Adjective,
      FishyNameTrait.Place,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.PacificOcean,
      FishyRegionTrait.Asia,
      new FishyDepthTrait(8, 20),
    ],
  }),

  new Level1Fishy({
    id: "white-edged-lyretail",
    name: "White-edged Lyretail",
    binomialName: "Variola albimarginata",
    rarity: FishyRarities.SuperRare,
    description:
      "This fish is found either as a solitary fish or in small groups on the seaward edge of reefs",
    emoji: FishyEmojis.whiteedgedLyretail,
    weight: {
      min: 4,
      max: 8,
    },
    url: "https://en.wikipedia.org/wiki/White-edged_lyretail",
    traits: [
      FishyNameTrait.Color,
      FishyNameTrait.Adjective,
      FishyPhysicalTrait.Spotted,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Grouper,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.IndianOcean,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(3, 200),
    ],
  }),

  new Level2Fishy({
    id: "crystal-shrimp",
    name: "Crystal Shrimp",
    binomialName: "Caridina cantonensis",
    rarity: FishyRarities.SuperRare,
    emoji: FishyEmojis.crystalShrimp,
    description: "This shrimp is a red and white variant of the Bee Shrimp.",
    weight: {
      min: 0.1,
      max: 1,
    },
    url: "https://en.wikipedia.org/wiki/Bee_shrimp",
    traits: [
      FishyNameTrait.Color,
      FishyPhysicalTrait.Red,
      FishyRegionTrait.Asia,
      FishyCategoryTrait.Shrimp,
      FishyCategoryTrait.Freshwater,
      new FishyDepthTrait(0, 15),
    ],
  }),

  new Level2Fishy({
    id: "denises-pygmy-seahorse",
    name: "Denise's Pygmy Seahorse",
    binomialName: "Hippocampus denise",
    rarity: FishyRarities.SuperRare,
    emoji: FishyEmojis.denisesPygmySeahorse,
    description:
      "This species was named after Denise Tackett, an underwater photographer!",
    weight: {
      min: 0.1,
      max: 0.1,
    },
    url: "https://en.wikipedia.org/wiki/Denise%27s_pygmy_seahorse",
    traits: [
      FishyPhysicalTrait.Spotted,
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Seahorse,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(13, 100),
    ],
  }),

  new Level3Fishy({
    id: "masked-crab",
    name: "Masked Crab",
    binomialName: "Corystes cassivelaunus",
    rarity: FishyRarities.SuperRare,
    emoji: FishyEmojis.maskedCrab,
    description:
      "The name 'Masked Crab' derives from the patterns on the carapace (shell) which resemble a human face",
    weight: {
      min: 0.1,
      max: 0.1,
    },
    url: "https://en.wikipedia.org/wiki/Corystes",
    traits: [
      FishyNameTrait.Adjective,
      FishyCategoryTrait.Crab,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.MediterraneanSea,
      new FishyDepthTrait(0, 100),
    ],
  }),

  new Level3Fishy({
    id: "red-devil-vampire-crab",
    name: "Red Devil Vampire Crab",
    binomialName: "Geosesarma hagen",
    rarity: FishyRarities.SuperRare,
    emoji: FishyEmojis.redDevilVampireCrab,
    description:
      "This species often creates shelters by digging up small amounts of dirt near bodies of water, and hides in them during the day",
    weight: {
      min: 0.1,
      max: 0.1,
    },
    url: "https://en.wikipedia.org/wiki/Geosesarma_hagen",
    traits: [
      FishyNameTrait.Color,
      FishyPhysicalTrait.Red,
      FishyRegionTrait.Asia,
      FishyCategoryTrait.Crab,
      FishyCategoryTrait.Freshwater,
      new FishyDepthTrait(0, 10),
    ],
  }),

  new Level3Fishy({
    id: "atlantic-pincer-lobster",
    name: "Atlantic Pincer Lobster",
    binomialName: "Thaumastocheles zaleucus",
    rarity: FishyRarities.SuperRare,
    emoji: FishyEmojis.atlanticPincerLobster,
    description:
      "This species has adapted to deep ocean life by becoming blind",
    weight: {
      min: 0.1,
      max: 0.2,
    },
    url: "https://en.wikipedia.org/wiki/Thaumastochelidae",
    traits: [
      FishyNameTrait.Place,
      FishyCategoryTrait.Lobster,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(650, 1000),
    ],
  }),
] satisfies Fishy[];
