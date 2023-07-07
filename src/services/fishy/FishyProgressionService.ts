import { Chance } from "chance";
import { IsNull, Not } from "typeorm";
import { User } from "../../database/entity/User";
import { FishyProfile } from "../../database/entity/fishy/FishyProfile";
import {
  FishyQuest,
  FishyQuestType,
} from "../../database/entity/fishy/FishyQuest";
import { getNumberEnumValues } from "../../helpers/enum";
import { fishyQuestLevelSize } from "../../helpers/fishy";
import { average } from "../../helpers/stats";
import { Emoji } from "../../lib/emoji/Emoji";
import { BaseService } from "../BaseService";
import { FishyRarities, FishyRarityData } from "./classes/Fishy";
import { getFishyList } from "./fishyList";

export class FishyProgressionService extends BaseService {
  private readonly rarities = [
    FishyRarities.Common,
    FishyRarities.Uncommon,
    FishyRarities.Rare,
    FishyRarities.SuperRare,
    FishyRarities.Legendary,
  ];

  public async getCurrentQuest(
    fishyProfile: FishyProfile
  ): Promise<FishyQuest | undefined> {
    return (
      (await FishyQuest.findOneBy({
        quester: { id: fishyProfile.user.id },
        completedAt: IsNull(),
      })) ?? undefined
    );
  }

  public async saveQuest(fishyQuest: FishyQuest): Promise<void> {
    await fishyQuest.save();
  }

  /** Returns true if the quest was completed */
  public async incrementQuestProgress(
    fishyQuest: FishyQuest,
    fishyProfile: FishyProfile
  ): Promise<boolean> {
    fishyQuest.progress++;

    if (fishyQuest.isCompleted) {
      fishyQuest.completedAt = new Date();
      fishyProfile.questsCompleted++;

      await fishyProfile.save();
    }

    this.saveQuest(fishyQuest);

    return fishyQuest.isCompleted;
  }

  public async getNextQuest(fishyProfile: FishyProfile): Promise<FishyQuest> {
    // The final quest before hitting the next level should be a milestone quest
    if (
      fishyProfile.questsCompleted &&
      fishyProfile.questsCompleted % fishyQuestLevelSize ===
        fishyQuestLevelSize - 1
    ) {
      return this.generateMilestoneFishyQuest(fishyProfile);
    } else {
      return await this.generateFishyQuest(fishyProfile);
    }
  }

  private async generateFishyQuest(
    fishyProfile: FishyProfile
  ): Promise<FishyQuest> {
    const tier =
      Math.floor(fishyProfile.questsCompleted / fishyQuestLevelSize) || 1;

    const questType = await this.pickQuestType(fishyProfile);

    const count = Chance().pickone([2 * tier, 3 * tier, 5 * tier]);

    switch (questType) {
      case FishyQuestType.Count:
        return this.generateCountFishyQuest(fishyProfile.user, count);
      case FishyQuestType.Rarity:
        return this.generateRarityFishyQuest(fishyProfile.user, count, tier);
      case FishyQuestType.Weight:
      default:
        return this.generateWeightFishyQuest(fishyProfile.user, count, tier);
    }
  }

  private generateCountFishyQuest(user: User, count: number): FishyQuest {
    return FishyQuest.create({
      quester: user,
      count: count,
      type: FishyQuestType.Count,
      emoji: this.pickFishyQuestEmoji(),
    });
  }

  private generateRarityFishyQuest(
    user: User,
    count: number,
    tier: number
  ): FishyQuest {
    const rarity = this.getRarityForTier(tier);
    const rebalancedCount = this.rebalanceCountForRarity(count, tier, rarity);

    return FishyQuest.create({
      quester: user,
      count: rebalancedCount,
      type: FishyQuestType.Rarity,
      stringConstraint: rarity.key,
      emoji: this.pickFishyQuestEmoji(),
    });
  }

  private generateWeightFishyQuest(
    user: User,
    count: number,
    tier: number
  ): FishyQuest {
    const rarity = this.getRarityForTier(tier);

    const weights = getFishyList(rarity).map(
      (f) => (f.maxWeight + f.minWeight) / 2
    );

    return FishyQuest.create({
      quester: user,
      count,
      numberConstraint: Math.floor(average(weights)) || 1,
      type: FishyQuestType.Weight,
      emoji: this.pickFishyQuestEmoji(),
    });
  }

  private generateMilestoneFishyQuest(fishyProfile: FishyProfile) {
    return FishyQuest.create({
      quester: fishyProfile.user,
      type: FishyQuestType.Milestone,
      count: 2 * fishyQuestLevelSize * (fishyProfile.level + 1),
      progress: fishyProfile.timesFished,
      emoji: this.pickFishyQuestEmoji(),
    });
  }

  private getRarityForTier(tier: number): FishyRarityData {
    return Chance().pickone(this.rarities.slice(0, tier));
  }

  private rebalanceCountForRarity(
    count: number,
    tier: number,
    rarity: FishyRarityData
  ): number {
    // Rebalance the count so that players aren't expected to catch large numbers of super rare fish
    // eg. 40 legendaries or 20 super rares
    return rarity === FishyRarities.Common || rarity === FishyRarities.Uncommon
      ? count
      : rarity === FishyRarities.Rare || rarity === FishyRarities.Trash
      ? Math.ceil(count / 2)
      : rarity === FishyRarities.SuperRare
      ? count / tier
      : rarity === FishyRarities.Legendary
      ? Chance().integer({ min: 1, max: 5 })
      : 1;
  }

  private async pickQuestType(
    fishyProfile: FishyProfile
  ): Promise<FishyQuestType> {
    const previousQuest = await FishyQuest.findOne({
      where: {
        quester: { id: fishyProfile.user.id },
        completedAt: Not(IsNull()),
      },
      order: { completedAt: "ASC" },
    });

    return Chance().pickone(
      getNumberEnumValues(FishyQuestType).filter(
        (qt) => qt !== FishyQuestType.Milestone && qt !== previousQuest?.type
      )
    ) as FishyQuestType;
  }

  private pickFishyQuestEmoji(): string {
    return Chance().pickone([
      Emoji.fishyQuestBook,
      Emoji.fishyQuestComputer,
      Emoji.fishyQuestDocument,
      Emoji.fishyQuestEnvelope,
      Emoji.fishyQuestNewspaper,
      Emoji.fishyQuestPhone,
      Emoji.fishyQuestScroll,
      Emoji.fishyQuestTV,
      Emoji.fishyQuestSpoken,
    ]);
  }
}
