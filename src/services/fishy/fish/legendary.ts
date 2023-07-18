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

export const legendaryFishies = [
  new Level1Fishy({
    id: "bull-shark",
    name: "Bull Shark",
    binomialName: "Carcharhinus leucas",
    rarity: FishyRarities.Legendary,
    description: "Bull Sharks were the inspiration for the 1974 novel *Jaws*.",
    emoji: FishyEmojis.bullShark,
    weight: {
      min: 100,
      max: 150,
    },
    url: "https://en.wikipedia.org/wiki/Bull_shark",
    traits: [
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AllOceans,
      FishyRegionTrait.Worldwide,
      new FishyDepthTrait(5, 100),
    ],
  }),

  new Level1Fishy({
    id: "north-pacific-swordfish",
    name: "North Pacific Swordfish",
    binomialName: "Xiphias gladius",
    rarity: FishyRarities.Legendary,
    description:
      'The popular belief of the "sword" being used as a spear is misleading, their nose is actually more likely to be used to slash at its prey.',
    emoji: FishyEmojis.northPacificSwordfish,
    weight: {
      min: 50,
      max: 200,
    },
    url: "https://en.wikipedia.org/wiki/Swordfish",
    traits: [
      FishyNameTrait.Place,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.IndianOcean,
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(3, 2000),
    ],
  }),

  new Level1Fishy({
    id: "hoodwinker-sunfish",
    name: "Hoodwinker Sunfish",
    binomialName: "Mola tecta",
    rarity: FishyRarities.Legendary,
    description:
      "This fish was only discovered in 2015, due to its habit of blending in with other species of sunfish.",
    emoji: FishyEmojis.hoodwinkerSunfish,
    weight: {
      min: 250,
      max: 1000,
    },
    url: "https://en.wikipedia.org/wiki/Mola_tecta",
    traits: [
      FishyPhysicalTrait.Spotted,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.PacificOcean,
      FishyRegionTrait.AtlanticOcean,
      new FishyDepthTrait(0, 200),
    ],
  }),

  new Level1Fishy({
    id: "megamouth-shark",
    name: "Megamouth Shark",
    binomialName: "Megachasma pelagios",
    rarity: FishyRarities.Legendary,
    description:
      "Since its discovery in 1976, fewer than 100 specimens have been observed or caught...",
    emoji: FishyEmojis.megamouthShark,
    weight: {
      min: 500,
      max: 1200,
    },
    url: "https://en.wikipedia.org/wiki/Megamouth_shark",
    traits: [
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.PacificOcean,
      FishyRegionTrait.AtlanticOcean,
      FishyRegionTrait.IndianOcean,
      new FishyDepthTrait(200, 1000),
    ],
  }),

  new Level1Fishy({
    id: "dana-octopus-squid",
    name: "Dana Octopus Squid",
    binomialName: "Taningia danae",
    rarity: FishyRarities.Legendary,
    description:
      'The Dana Octopus Squid possesses giant bioluminescence organs the size of lemons, which it can "blink" using a black membrane.',
    emoji: FishyEmojis.danaOctopusSquid,
    weight: {
      min: 500,
      max: 1200,
    },
    url: "https://en.wikipedia.org/wiki/Taningia_danae",
    traits: [
      FishyPhysicalTrait.Red,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.AllOceans,
      new FishyDepthTrait(200, 1000),
    ],
  }),

  new Level2Fishy({
    id: "ghost-shrimp",
    name: "Ghost Shrimp",
    binomialName: "Palaemonetes paludosus",
    rarity: FishyRarities.Legendary,
    emoji: FishyEmojis.ghostShrimp,
    description:
      "This shrimp is nocturnal, remaining hidden among the vegetation by day, and emerging at night to feed on plankton",
    weight: {
      min: 0.1,
      max: 1,
    },
    url: "https://en.wikipedia.org/wiki/Palaemon_paludosus",
    traits: [
      FishyPhysicalTrait.Transparent,
      FishyCategoryTrait.Shrimp,
      FishyCategoryTrait.Freshwater,
      FishyRegionTrait.NorthAmerica,
      new FishyDepthTrait(0, 10),
    ],
  }),

  new Level2Fishy({
    id: "zebra-seahorse",
    name: "Zebra Seahorse",
    binomialName: "Hippocampus zebra",
    rarity: FishyRarities.Legendary,
    emoji: FishyEmojis.zebraSeahorse,
    description:
      "This species is ovoviviparous, which means it carries the eggs in a pouch which is situated under the tail",
    weight: {
      min: 0.1,
      max: 0.5,
    },
    url: "https://en.wikipedia.org/wiki/Zebra_seahorse",
    traits: [
      FishyPhysicalTrait.Striped,
      FishyCategoryTrait.Seahorse,
      FishyCategoryTrait.Saltwater,
      FishyRegionTrait.Oceania,
      new FishyDepthTrait(2, 69),
    ],
  }),

  new Level2Fishy({
    id: "sea-angel",
    name: "Sea Angel",
    binomialName: "Clione limacina",
    rarity: FishyRarities.Legendary,
    emoji: FishyEmojis.clione,
    description:
      "This species was first described in 1676, when it became the first pteropod without a shell to be described",
    weight: {
      min: 0,
      max: 0,
    },
    url: "https://en.wikipedia.org/wiki/Clione_limacina",
    traits: [
      FishyPhysicalTrait.Transparent,
      FishyRegionTrait.ArcticOcean,
      FishyRegionTrait.AtlanticOcean,
      FishyCategoryTrait.Saltwater,
      new FishyDepthTrait(0, 500),
    ],
  }),

  new Level3Fishy({
    id: "palawan-purple-crab",
    name: "Palawan Purple Crab",
    binomialName: "Insulamon palawanense",
    rarity: FishyRarities.Legendary,
    emoji: FishyEmojis.palawanPurpleCrab,
    description: "This species of crab was only recently described in 2012",
    weight: {
      min: 0.1,
      max: 0.3,
    },
    url: "https://en.wikipedia.org/wiki/Insulamon_palawanense",
    traits: [
      FishyNameTrait.Color,
      FishyNameTrait.Place,
      FishyPhysicalTrait.Purple,
      FishyCategoryTrait.Crab,
      FishyCategoryTrait.Freshwater,
      FishyRegionTrait.Asia,
      new FishyDepthTrait(0, 10),
    ],
  }),

  new Level3Fishy({
    id: "banded-sea-urchin",
    name: "Banded Sea Urchin",
    binomialName: "Echinothrix calamaris",
    rarity: FishyRarities.Legendary,
    emoji: FishyEmojis.bandedSeaUrchin,
    description:
      "This sea urchin is active at night, hiding in crevices or under rocks during the day",
    weight: {
      min: 0.1,
      max: 0.3,
    },
    displayMode: FishyDisplayMode.Bottom,
    url: "https://en.wikipedia.org/wiki/Echinothrix_calamaris",
    traits: [
      FishyNameTrait.Adjective,
      FishyPhysicalTrait.Striped,
      FishyCategoryTrait.Urchin,
      FishyRegionTrait.IndianOcean,
      FishyRegionTrait.PacificOcean,
      new FishyDepthTrait(0, 70),
    ],
  }),
] satisfies Fishy[];
