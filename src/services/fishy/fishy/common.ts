import { FishyEmojiList } from "../../../lib/emoji/FishEmoji";
import { Fishy, FishyRarities } from "../Fishy";

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
  }),
  // new Fishy({
  //   id: "channel-catfish",
  //   name: "Channel Catfish",
  //   binomialName: "Ictalurus punctatus",
  //   rarity: FishyRarities.Common,
  //   emoji
  //   description:
  //     'It is the official fish of Kansas, Missouri, Nebraska, and Tennessee, and is informally referred to as a "channel cat"',
  //   weight: {
  //     min: 1,
  //     max: 4.5,
  //   },
  // }),
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
  }),
  new Fishy({
    id: "walleye",
    name: "Walleye",
    binomialName: "Sander vitreus",
    rarity: FishyRarities.Common,
    emoji: FishyEmojiList.walleye,
    description: "Walleyes have thousands of taste bugs in their lips!",
    weight: {
      min: 5,
      max: 9,
    },
  }),
] satisfies Fishy[];
