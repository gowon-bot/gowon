import { Chance } from "chance";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { bold } from "../../../helpers/discord";
import { FishyRarityEmojiList } from "../../../lib/emoji/FishyRarityEmoji";
import { displayNumber } from "../../../lib/views/displays";
import {
  FishyRarities,
  FishyRarityKey,
} from "../../../services/fishy/classes/Fishy";
import { User } from "../User";
import { FishyCatch } from "./FishyCatch";

export enum FishyQuestType {
  Count = 0,
  Rarity,
  Weight,
  Milestone,
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
      case FishyQuestType.Milestone:
        return `Catch ${bold(displayNumber(this.count))} fishy in total`;
    }

    return "";
  }

  public countsTowardsQuest(fishyCatch: FishyCatch): boolean {
    switch (this.type) {
      case FishyQuestType.Count:
        return !fishyCatch.fishy.rarity.isTrash();
      case FishyQuestType.Rarity:
        return (
          FishyRarities[this.stringConstraint! as FishyRarityKey] ===
          fishyCatch.fishy.rarity
        );
      case FishyQuestType.Weight:
        return fishyCatch.weight >= this.numberConstraint!;
      case FishyQuestType.Milestone:
        true;
    }

    return false;
  }

  private getQuestNameForRarity(start: string): string {
    const rarity =
      FishyRarities[this.stringConstraint! as keyof typeof FishyRarities];

    return (
      start +
      `${bold(
        rarity.isTrash()
          ? `pieces of ${FishyRarityEmojiList.trash.base}Trash`
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
