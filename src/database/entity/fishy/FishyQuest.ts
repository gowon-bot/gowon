import { Chance } from "chance";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { bold } from "../../../helpers/discord";
import { FishyRarityEmojis } from "../../../lib/emoji/FishyRarityEmoji";
import { displayNumber } from "../../../lib/views/displays";
import { FishyTraitNoDepth } from "../../../services/fishy/quests/QuestTraitPicker";
import { FishyRarities } from "../../../services/fishy/rarity";
import { displayFishyTrait } from "../../../services/fishy/traits";
import { User } from "../User";

export enum FishyQuestType {
  Count = 0,
  Rarity,
  Weight,
  Milestone,
  Trait,
}

@Entity({ name: "fishy_quests" })
export class FishyQuest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  count!: number;

  @Column({ default: 0 })
  progress!: number;

  @Column()
  emoji!: string;

  @Column({ type: "enum", enum: FishyQuestType })
  type!: number;

  @Column({ nullable: true })
  numberConstraint?: number;

  @Column({ nullable: true })
  stringConstraint?: string;

  @ManyToOne((_) => User, (user) => user.fishyQuests)
  quester!: User;

  @Column({ nullable: true })
  completedAt?: Date;

  get isCompleted(): boolean {
    return this.progress >= this.count;
  }

  get isMilestone(): boolean {
    return this.type === FishyQuestType.Milestone;
  }

  get name(): string {
    const questStart = this.getQuestStart();

    switch (this.type) {
      case FishyQuestType.Count:
        return questStart + "fishy.";
      case FishyQuestType.Rarity:
        return this.getQuestNameForRarity(questStart);
      case FishyQuestType.Weight:
        return this.getQuestNameForWeight(questStart);
      case FishyQuestType.Trait:
        return this.getQuestNameForTrait(questStart);
      case FishyQuestType.Milestone:
        return `Catch ${bold(displayNumber(this.count))} fishy in total`;
    }

    return "";
  }

  private getQuestNameForRarity(start: string): string {
    const rarity =
      FishyRarities[this.stringConstraint! as keyof typeof FishyRarities];

    return (
      start +
      `${bold(
        rarity.isTrash()
          ? `pieces of ${FishyRarityEmojis.trash.base}Trash`
          : `${rarity.emoji.base}${rarity.name} fishy`
      )}`
    );
  }

  private getQuestNameForWeight(start: string): string {
    return (
      start +
      `fishy weighing at least **${displayNumber(this.numberConstraint)}kg**.`
    );
  }

  private getQuestNameForTrait(start: string): string {
    return (
      start +
      displayFishyTrait(this.stringConstraint as FishyTraitNoDepth, true)
    );
  }

  private getQuestStart(): string {
    return (
      Chance().pickone([
        `Catch ${bold(displayNumber(this.count))}`,
        `Find ${bold(displayNumber(this.count))}`,
        `Hook ${bold(displayNumber(this.count))}`,
      ]) + " "
    );
  }
}
