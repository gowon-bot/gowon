import { FishyEmojiList } from "../../../lib/emoji/FishyEmoji";
import { BaseFishy } from "../classes/BaseFishy";
import { Fishy, FishyRarities } from "../classes/Fishy";
import { GlovesFishy } from "../classes/GlovesFishy";
import { NetFishy } from "../classes/NetFishy";

export const superRareFishies = [
  new Fishy({
    id: "triplewart-seadevil",
    name: "Triplewart Seadevil",
    binomialName: "Cryptopsaras couesii",
    rarity: FishyRarities.SuperRare,
    description:
      "This fish can extend and contract the lure atatched to the front of its body.",
    emoji: FishyEmojiList.triplewartSeadevil,
    weight: {
      min: 3,
      max: 6,
    },
  }),

  new Fishy({
    id: "smooth-head-blobfish",
    name: "Smooth-head blobfish",
    binomialName: "Psychrolutes marcidus",
    rarity: FishyRarities.SuperRare,
    description: ":(",
    emoji: FishyEmojiList.smoothheadBlobfish,
    weight: {
      min: 9,
      max: 10,
    },
  }),

  new Fishy({
    id: "peppermint-angelfish",
    name: "Peppermint Angelfish",
    binomialName: "Centropyge boylei",
    rarity: FishyRarities.SuperRare,
    description: "A single peppermint angelfish once sold for 30,000 dollars!",
    emoji: FishyEmojiList.peppermintAngelfish,
    weight: {
      min: 0.7,
      max: 2,
    },
  }),

  new Fishy({
    id: "blackspotted-puffer",
    name: "Blackspotted Puffer",
    binomialName: "Arothron nigropunctatus",
    rarity: FishyRarities.SuperRare,
    description:
      "The Blackspotted Puffer holds the deadly poison tetrodotoxin, which protects it from predators.",
    emoji: FishyEmojiList.blackspottedPuffer,
    weight: {
      min: 2,
      max: 8,
    },
  }),

  new Fishy({
    id: "asian-sheepshead-wrasse",
    name: "Asian Sheepshead Wrasse",
    binomialName: "Semicossyphus reticulatus",
    rarity: FishyRarities.SuperRare,
    description:
      "This fish is a hermaphroditic species, meaning that it has both male and female organs, which allows it to change its sex. 🏳️‍⚧️",
    emoji: FishyEmojiList.asianSheepsheadWrasse,
    weight: {
      min: 5,
      max: 15,
    },
  }),

  new Fishy({
    id: "white-edged-lyretail",
    name: "White-edged Lyretail",
    binomialName: "Variola albimarginata",
    rarity: FishyRarities.SuperRare,
    description:
      "This fish is found either as a solitary fish or in small groups on the seaward edge of reefs",
    emoji: FishyEmojiList.whiteedgedLyretail,
    weight: {
      min: 4,
      max: 8,
    },
  }),

  new NetFishy({
    id: "crystal-shrimp",
    name: "Crystal Shrimp",
    binomialName: "Caridina cantonensis",
    rarity: FishyRarities.SuperRare,
    emoji: FishyEmojiList.crystalShrimp,
    description: "This shrimp is a red and white variant of the Bee Shrimp.",
    weight: {
      min: 0.1,
      max: 1,
    },
  }),

  new NetFishy({
    id: "denises-pygmy-seahorse",
    name: "Denise's Pygmy Seahorse",
    binomialName: "Hippocampus denise",
    rarity: FishyRarities.SuperRare,
    emoji: FishyEmojiList.denisesPygmySeahorse,
    description:
      "This species was named after Denise Tackett, an underwater photographer!",
    weight: {
      min: 0.1,
      max: 0.1,
    },
  }),

  new GlovesFishy({
    id: "masked-crab",
    name: "Masked Crab",
    binomialName: "Corystes cassivelaunus",
    rarity: FishyRarities.SuperRare,
    emoji: FishyEmojiList.maskedCrab,
    description:
      "The name 'Masked Crab' derives from the patterns on the carapace (shell) which resemble a human face",
    weight: {
      min: 0.1,
      max: 0.1,
    },
  }),

  new GlovesFishy({
    id: "red-devil-vampire-crab",
    name: "Red Devil Vampire Crab",
    binomialName: "Geosesarma hagen",
    rarity: FishyRarities.SuperRare,
    emoji: FishyEmojiList.redDevilVampireCrab,
    description:
      "This species often creates shelters by digging up small amounts of dirt near bodies of water, and hides in them during the day",
    weight: {
      min: 0.1,
      max: 0.1,
    },
  }),

  new GlovesFishy({
    id: "atlantic-pincer-lobster",
    name: "Atlantic Pincer Lobster",
    binomialName: "Thaumastocheles zaleucus",
    rarity: FishyRarities.SuperRare,
    emoji: FishyEmojiList.atlanticPincerLobster,
    description:
      "This species has adapted to deep ocean life by becoming blind",
    weight: {
      min: 0.1,
      max: 0.2,
    },
  }),
] satisfies BaseFishy[];
