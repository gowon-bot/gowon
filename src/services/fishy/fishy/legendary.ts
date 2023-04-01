import { FishyEmojiList } from "../../../lib/emoji/FishEmoji";
import { Fishy, FishyRarities } from "../Fishy";

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
] satisfies Fishy[];
