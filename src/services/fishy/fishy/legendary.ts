import { FishyEmojiList } from "../../../lib/emoji/FishEmoji";
import { BaseFishy } from "../classes/BaseFishy";
import { Fishy, FishyRarities } from "../classes/Fishy";
import { GlovesFishy } from "../classes/GlovesFishy";
import { NetFishy } from "../classes/NetFishy";

export const legendaryFishies = [
  new Fishy({
    id: "bull-shark",
    name: "Bull Shark",
    binomialName: "Carcharhinus leucas",
    rarity: FishyRarities.Legendary,
    description: "Bull Sharks were the inspiration for the 1974 novel *Jaws*.",
    emoji: FishyEmojiList.bullShark,
    weight: {
      min: 100,
      max: 150,
    },
  }),

  new Fishy({
    id: "north-pacific-swordfish",
    name: "North Pacific Swordfish",
    binomialName: "Xiphias gladius",
    rarity: FishyRarities.Legendary,
    description:
      'The popular belief of the "sword" being used as a spear is misleading, their nose is actually more likely to be used to slash at its prey.',
    emoji: FishyEmojiList.northPacificSwordfish,
    weight: {
      min: 50,
      max: 200,
    },
  }),

  new Fishy({
    id: "hoodwinker-sunfish",
    name: "Hoodwinker Sunfish",
    binomialName: "Mola tecta",
    rarity: FishyRarities.Legendary,
    description:
      "This fish was only discovered in 2015, due to its habit of blending in with other species of sunfish.",
    emoji: FishyEmojiList.hoodwinkerSunfish,
    weight: {
      min: 250,
      max: 1000,
    },
  }),

  new Fishy({
    id: "megamouth-shark",
    name: "Megamouth Shark",
    binomialName: "Megachasma pelagios",
    rarity: FishyRarities.Legendary,
    description:
      "Since its discovery in 1976, fewer than 100 specimens have been observed or caught...",
    emoji: FishyEmojiList.megamouthShark,
    weight: {
      min: 500,
      max: 1200,
    },
  }),

  new Fishy({
    id: "dana-octopus-squid",
    name: "Dana Octopus Squid",
    binomialName: "Taningia danae",
    rarity: FishyRarities.Legendary,
    description:
      'The Dana Octopus Squid possesses giant bioluminescence organs the size of lemons, which it can "blink" using a black membrane.',
    emoji: FishyEmojiList.danaOctopusSquid,
    weight: {
      min: 500,
      max: 1200,
    },
  }),

  new NetFishy({
    id: "ghost-shrimp",
    name: "Ghost Shrimp",
    binomialName: "Palaemonetes paludosus",
    rarity: FishyRarities.Legendary,
    emoji: FishyEmojiList.ghostShrimp,
    description:
      "This shrimp is nocturnal, remaining hidden among the vegetation by day, and emerging at night to feed on plankton",
    weight: {
      min: 0.1,
      max: 1,
    },
  }),

  new NetFishy({
    id: "zebra-seahorse",
    name: "Zebra Seahorse",
    binomialName: "Hippocampus zebra",
    rarity: FishyRarities.Legendary,
    emoji: FishyEmojiList.zebraSeahorse,
    description:
      "This species is ovoviviparous, which means it carries the eggs in a pouch which is situated under the tail",
    weight: {
      min: 0.1,
      max: 0.5,
    },
  }),

  new NetFishy({
    id: "sea-angel",
    name: "Sea Angel",
    binomialName: "Clione limacina",
    rarity: FishyRarities.Legendary,
    emoji: FishyEmojiList.clione,
    description:
      "This species was first described in 1676, when it became the first pteropod without a shell to be described",
    weight: {
      min: 0,
      max: 0,
    },
  }),

  new GlovesFishy({
    id: "palawan-purple-crab",
    name: "Palawan Purple Crab",
    binomialName: "Insulamon palawanense",
    rarity: FishyRarities.Legendary,
    emoji: FishyEmojiList.palawanPurpleCrab,
    description: "This species of crab was only recently described in 2012",
    weight: {
      min: 0.1,
      max: 0.3,
    },
  }),
] satisfies BaseFishy[];
