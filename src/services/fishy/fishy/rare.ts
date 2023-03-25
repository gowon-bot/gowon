import { FishyEmojiList } from "../../../lib/emoji/FishEmoji";
import { Fishy, FishyRarities } from "../Fishy";

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
      min: 0.1,
      max: 0.2,
    },
  }),
  new Fishy({
    id: "yellow-boxfish",
    name: "Yellow Boxfish",
    binomialName: "Ostracion cubicum",
    rarity: FishyRarities.Rare,
    description:
      "Boxfish are also known for their armored and rigid body, which is adapted to its style of swimming",
    emoji: FishyEmojiList.yellowBoxfish,
    weight: {
      min: 1,
      max: 3,
    },
  }),
] satisfies Fishy[];
