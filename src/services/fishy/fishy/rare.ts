import { FishyEmojiList } from "../../../lib/emoji/FishEmoji";
import { BaseFishy } from "../classes/BaseFishy";
import { Fishy, FishyRarities } from "../classes/Fishy";
import { GlovesFishy } from "../classes/GlovesFishy";
import { NetFishy } from "../classes/NetFishy";

export const rareFishies = [
  new Fishy({
    id: "blue-betta",
    name: "Blue Betta",
    binomialName: "Betta smaragdina",
    rarity: FishyRarities.Rare,
    description:
      "The species gets its blue colours due to refraction and interference of light that results from hexagonal crystals that are less than 0.5 micrometres",
    emoji: FishyEmojiList.blueBetta,
    weight: {
      min: 0.1,
      max: 0.2,
    },
  }),

  new Fishy({
    id: "orange-clownfish",
    name: "Orange Clownfish",
    binomialName: "Amphiprion percula",
    rarity: FishyRarities.Rare,
    description:
      "This fish hides from predators in sea anenome's stinging tentacles, which it is immune to",
    emoji: FishyEmojiList.clownfish,
    weight: {
      min: 1,
      max: 3,
    },
  }),

  new Fishy({
    id: "yellow-boxfish",
    name: "Yellow Boxfish",
    binomialName: "Ostracion cubicum",
    rarity: FishyRarities.Rare,
    description:
      "Boxfish are known for their armored and rigid body, which is adapted to its style of swimming",
    emoji: FishyEmojiList.yellowBoxfish,
    weight: {
      min: 1,
      max: 3,
    },
  }),

  new Fishy({
    id: "banded-rainbowfish",
    name: "Banded Rainbowfish",
    binomialName: "Melanotaenia trifasciata",
    rarity: FishyRarities.Rare,
    description:
      "Males compete with one another for territory and female attention in contests where they compare body coloration and size",
    emoji: FishyEmojiList.bandedRainbowfish,
    weight: {
      min: 0.5,
      max: 2,
    },
  }),

  new Fishy({
    id: "yellow-tail-acei",
    name: "Yellow-tail Acei",
    binomialName: 'Pseudotropheus sp. "acei"',
    rarity: FishyRarities.Rare,
    description:
      "This fish can only be found naturally in Lake Malawi, however it is a popular fish for fish-keepers",
    emoji: FishyEmojiList.yellowtailAcei,
    weight: {
      min: 0.3,
      max: 1.7,
    },
  }),

  new Fishy({
    id: "spanish-flag",
    name: "Spanish Flag",
    binomialName: "Gonioplectrus hispanus",
    rarity: FishyRarities.Rare,
    description: "Not to be confused with the Spanish flag",
    emoji: FishyEmojiList.spanishFlag,
    weight: {
      min: 4,
      max: 7,
    },
  }),

  new Fishy({
    id: "goldenstriped-soapfish",
    name: "Goldenstriped Soapfish",
    binomialName: "Grammistes sexlineatus",
    rarity: FishyRarities.Rare,
    description:
      "The secretions from the skin of soapfish resemble lathered soap, and are the basis for the name.",
    emoji: FishyEmojiList.goldenstripedSoapfish,
    weight: {
      min: 3,
      max: 6,
    },
  }),

  new NetFishy({
    id: "blue-bolt-shrimp",
    name: "Blue Bolt Shrimp",
    binomialName: "Caridina cantonensis",
    rarity: FishyRarities.Rare,
    emoji: FishyEmojiList.blueBoltShrimp,
    description:
      "This shrimp is a blue variant of the Bee Shrimp, named after its brilliant blue colour.",
    weight: {
      min: 0.1,
      max: 1,
    },
  }),

  new NetFishy({
    id: "cardinal-shrimp",
    name: "Cardinal Shrimp",
    binomialName: "Caridina dennerli",
    rarity: FishyRarities.Rare,
    emoji: FishyEmojiList.cardinalShrimp,
    description:
      "No Caridina dennerli have been recorded in the wild since 2013, and the species possibly is extinct in the wild. However, it is still kept and bred in captivity.",
    weight: {
      min: 0.1,
      max: 1,
    },
  }),

  new NetFishy({
    id: "big-belly-seahorse",
    name: "Big-belly Seahorse",
    binomialName: "Hippocampus abdominalis",
    rarity: FishyRarities.Rare,
    emoji: FishyEmojiList.bigbellySeahorse,
    description:
      "Each this species' eyes can move independently, allowing it to more easily see predators",
    weight: {
      min: 0.1,
      max: 1,
    },
  }),

  new GlovesFishy({
    id: "sleepy-crab",
    name: "Sleepy Crab",
    binomialName: "Dromia dormia",
    rarity: FishyRarities.Rare,
    emoji: FishyEmojiList.sleepyCrab,
    description:
      "This species of crab carries a sponge on its back, earning it the nickname of Sponge Crab",
    weight: {
      min: 0.1,
      max: 1,
    },
  }),

  new GlovesFishy({
    id: "golden-king-crab",
    name: "Golden King Crab",
    binomialName: "Lithodes aequispinus",
    rarity: FishyRarities.Rare,
    emoji: FishyEmojiList.goldenKingCrab,
    description: "This crab uses its strong sense of smell to seek out food",
    weight: {
      min: 0.1,
      max: 1,
    },
  }),

  // Achelous sebae
  // Quadrella maculosa
  // Favus granulatus
] satisfies BaseFishy[];
