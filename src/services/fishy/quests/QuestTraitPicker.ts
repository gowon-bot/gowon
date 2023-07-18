import { Chance } from "chance";
import { FishyProfile } from "../../../database/entity/fishy/FishyProfile";
import { Fishy } from "../Fishy";
import { getFishyList } from "../fishyList";
import { FishyTrait } from "../traits";
import { FishyDepthTrait, isFishyDepthTrait } from "../traits/depth";

export type FishyTraitNoDepth = Exclude<FishyTrait, FishyDepthTrait>;
type TraitLikelinessHistogram = Record<FishyTraitNoDepth, number>;

export class QuestTraitPicker {
  pick(fishyProfile: FishyProfile): {
    trait: FishyTraitNoDepth;
    likeliness: number;
  } {
    const likelinessThreshold = this.getLikelinessThreshold(fishyProfile);

    const pickableTraits = this.getPickableTraits(
      fishyProfile,
      likelinessThreshold
    );

    const [trait, likeliness] = new Chance().pickone(pickableTraits);

    return { trait, likeliness };
  }

  private getPickableTraits(
    fishyProfile: FishyProfile,
    likelinessThreshold: number
  ): [trait: FishyTraitNoDepth, likeliness: number][] {
    const fishyPool = getFishyList(undefined, fishyProfile.level).filter(
      (f) => !f.rarity.isTrash()
    );

    const traitLikelinessHistogram = fishyPool.reduce((acc, fishy) => {
      const traits = fishy.traits.filter(
        (t) => !isFishyDepthTrait(t)
      ) as FishyTraitNoDepth[];

      for (const trait of traits) {
        acc[trait] ||= 0;
        acc[trait] += this.getTraitLikliness(fishy) / fishyPool.length;
      }

      return acc;
    }, {} as TraitLikelinessHistogram);

    return Object.entries(traitLikelinessHistogram).filter(
      ([, likeliness]) => likeliness >= likelinessThreshold
    ) as [FishyTraitNoDepth, number][];
  }

  private getTraitLikliness(fishy: Fishy): number {
    return fishy.rarity.weight * 10;
  }

  private getLikelinessThreshold(fishyProfile: FishyProfile) {
    switch (fishyProfile.level) {
      case 1:
        return 30;

      case 2:
        return 25;

      case 3:
        return 20;

      default:
        return 15;
    }
  }
}
