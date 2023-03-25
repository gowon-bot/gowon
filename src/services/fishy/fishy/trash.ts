import { TrashEmoji } from "../../../lib/emoji/FishEmoji";
import { Fishy, FishyRarities } from "../Fishy";

export const trash = [
  new Fishy({
    id: "old-boot",
    name: "Old boot",
    binomialName: "Vetus calceus",
    rarity: FishyRarities.Trash,
    emoji: new TrashEmoji("👢"),
    description: "Someone must've lost their boot in the water...",
    weight: { min: 0, max: 0 },
  }),

  new Fishy({
    id: "favourite-album",
    name: "A copy of your favourite album",
    binomialName: "Malus musica",
    rarity: FishyRarities.Trash,
    description: "Unless your favourite album is Loona's Go Won of course",
    emoji: new TrashEmoji("💿"),
    weight: { min: 0, max: 0 },
  }),

  new Fishy({
    id: "miso-soup",
    name: "Miso soup",
    binomialName: "Pulmenti miso",
    rarity: FishyRarities.Trash,
    description: "Not guaranteed to not be a robot",
    emoji: new TrashEmoji("🍜"),
    weight: { min: 0, max: 0 },
  }),
] satisfies Fishy[];
