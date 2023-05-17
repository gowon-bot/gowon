import { add, differenceInMilliseconds, intervalToDuration } from "date-fns";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { constants } from "../../../lib/constants";
import { humanizeDuration } from "../../../lib/timeAndDate/helpers/humanize";
import { User } from "../User";

@Entity({ name: "fishy_profiles" })
export class FishyProfile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  lastFished!: Date;

  @Column({ default: 0 })
  timesFished!: number;

  @Column({ default: 0, type: "float" })
  totalWeight!: number;

  @Column({ default: 0 })
  questsCompleted!: number;

  @OneToOne((_) => User, (user) => user.fishyProfile, { eager: true })
  @JoinColumn()
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  public canFish(): boolean {
    return (
      !this.lastFished ||
      new Date() > add(this.lastFished, constants.fishyCooldown)
    );
  }

  public getCooldownTime(): string {
    const difference = differenceInMilliseconds(
      new Date(),
      add(this.lastFished, constants.fishyCooldown)
    );

    const duration = intervalToDuration({ start: 0, end: difference });

    if (duration.seconds && (duration.hours || duration.minutes)) {
      delete duration.seconds;
    }

    const time = humanizeDuration(duration);

    return time;
  }
}
