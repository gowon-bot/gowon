import { Emoji } from "../../lib/Emoji";
import { Fishy, FishyRarities, FishyRarityData } from "./Fishy";

const trash: Fishy[] = [
  new Fishy({
    id: "old-boot",
    name: "Old boot",
    binomialName: "Vetus calceus",
    rarity: FishyRarities.Trash,
    description: "Someone must've lost their boot in the water...",
    weight: { min: 0, max: 0 },
  }),

  new Fishy({
    id: "favourite-album",
    name: "A copy of your favourite album",
    binomialName: "Malus musica",
    rarity: FishyRarities.Trash,
    description: "Unless your favourite album is Loona's Go Won of course",
    emoji: "📀",
    weight: { min: 0, max: 0 },
  }),

  new Fishy({
    id: "miso-soup",
    name: "Miso soup",
    binomialName: "Pulmenti miso",
    rarity: FishyRarities.Trash,
    description: "Not guaranteed to not be a robot",
    emoji: "🍜",
    weight: { min: 0, max: 0 },
  }),
];

const commonFishies: Fishy[] = [
  new Fishy({
    id: "rainbow-trout",
    name: "Rainbow Trout",
    binomialName: "Oncorhynchus mykiss",
    rarity: FishyRarities.Common,
    description:
      "A species of trout native to cold-water tributaries of the Pacific Ocean in Asia and North America",
    weight: {
      min: 0.5,
      max: 2.5,
    },
  }),

  new Fishy({
    id: "channel-catfish",
    name: "Channel Catfish",
    binomialName: "Ictalurus punctatus",
    rarity: FishyRarities.Common,
    description:
      'It is the official fish of Kansas, Missouri, Nebraska, and Tennessee, and is informally referred to as a "channel cat"',
    weight: {
      min: 1,
      max: 4.5,
    },
  }),
];

const rareFishies: Fishy[] = [
  new Fishy({
    id: "blue-betta",
    name: "Blue Betta",
    binomialName: "Betta smaragdina",
    rarity: FishyRarities.Rare,
    description:
      "The species gets its blue colours due to refraction and interference of light that results from hexagonal crystals that are less than 0.5 micrometres",
    emoji: Emoji.blueBetta,
    weight: {
      min: 0.1,
      max: 0.2,
    },
  }),
];

export const fishyList = [...trash, ...commonFishies, ...rareFishies];

export function getFishyList(rarity: FishyRarityData): Fishy[] {
  switch (rarity.name) {
    case FishyRarities.Trash.name:
      return trash;

    case FishyRarities.Common.name:
      return commonFishies;

    case FishyRarities.Rare.name:
      return rareFishies;

    default:
      return fishyList;
  }
}

export function findFishy(name: string | { byID: string }): Fishy | undefined {
  const equalize = (str: string) => str.toLowerCase().replace(/[\s-_]+/, "");

  return fishyList.find((f) =>
    typeof name === "string"
      ? equalize(f.name) === equalize(name)
      : f.id === name.byID
  );
}
