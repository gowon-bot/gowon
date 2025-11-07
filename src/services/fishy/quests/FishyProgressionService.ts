import { Chance } from "chance";
import { IsNull, Not } from "typeorm";
import { User } from "../../../database/entity/User";
import { FishyCatch } from "../../../database/entity/fishy/FishyCatch";
import { FishyProfile } from "../../../database/entity/fishy/FishyProfile";
import {
  FishyQuest,
  FishyQuestType,
} from "../../../database/entity/fishy/FishyQuest";
import { getNumberEnumValues } from "../../../helpers/enum";
import { fishyQuestLevelSize } from "../../../helpers/fishy";
import { Emoji } from "../../../lib/emoji/Emoji";
import { BaseService } from "../../BaseService";
import { FishyRarities, FishyRarityData, FishyRarityKey } from "../rarity";
import { matchesFishyTrait } from "../traits";
import { FishyTraitNoDepth, QuestTraitPicker } from "./QuestTraitPicker";

export class FishyProgressionService extends BaseService {
  private questTraitPicker = new QuestTraitPicker();

  private readonly rarities = [
    FishyRarities.Common,
    FishyRarities.Uncommon,
    FishyRarities.Rare,
  ];

  private readonly questWeights = [1, 5, 10];

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

  public countsTowardsQuest(
    quest: FishyQuest,
    fishyCatch: FishyCatch
  ): boolean {
    switch (quest.type) {
      case FishyQuestType.Count:
        return !fishyCatch.fishy.rarity.isTrash();
      case FishyQuestType.Rarity:
        return (
          FishyRarities[quest.stringConstraint! as FishyRarityKey] ===
          fishyCatch.fishy.rarity
        );
      case FishyQuestType.Weight:
        return fishyCatch.weight >= quest.numberConstraint!;
      case FishyQuestType.Trait:
        return matchesFishyTrait(
          fishyCatch.fishy,
          quest.stringConstraint! as FishyTraitNoDepth
        );
      case FishyQuestType.Milestone:
        true;
    }

    return false;
  }

  private async generateFishyQuest(
    fishyProfile: FishyProfile
  ): Promise<FishyQuest> {
    const tier =
      Math.floor(fishyProfile.questsCompleted / fishyQuestLevelSize) || 1;

    const questType = await this.pickQuestType(fishyProfile);

    const count = Chance().pickone([1 * tier, 2 * tier, 3 * tier]);

    switch (questType) {
      case FishyQuestType.Count:
        return this.generateCountFishyQuest(fishyProfile.user, count);
      case FishyQuestType.Rarity:
        return this.generateRarityFishyQuest(fishyProfile.user, count, tier);
      case FishyQuestType.Trait:
        return this.generateTraitFishyQuest(fishyProfile);
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

  private generateTraitFishyQuest(fishyProfile: FishyProfile): FishyQuest {
    const { trait, likeliness } = this.questTraitPicker.pick(fishyProfile);

    const count = likeliness > 100 ? 5 : likeliness > 50 ? 3 : 1;

    return FishyQuest.create({
      quester: fishyProfile.user,
      count: count,
      type: FishyQuestType.Trait,
      stringConstraint: trait,
      emoji: this.pickFishyQuestEmoji(),
    });
  }

  private generateRarityFishyQuest(
    user: User,
    count: number,
    tier: number
  ): FishyQuest {
    const rarity = this.getRarityForTier(tier);
    const rebalancedCount = this.rebalanceCountForRarity(count, rarity);

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
    const weightLevel = Chance().shuffle(this.questWeights.slice(0, tier))[0];

    return FishyQuest.create({
      quester: user,
      count,
      numberConstraint: weightLevel,
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
    rarity: FishyRarityData
  ): number {
    // Rebalance the count so that players aren't expected to catch large numbers of super rare fish
    // eg. 40 legendaries or 20 super rares
    return rarity === FishyRarities.Common || rarity === FishyRarities.Uncommon
      ? count
      : rarity === FishyRarities.Rare || rarity === FishyRarities.Trash
      ? Math.ceil(count / 2)
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
      order: { completedAt: "DESC" },
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
