import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import {
  CrownEventString,
  SnatchedEventString,
} from "../../../services/dbservices/CrownsHistoryService";
import { Crown } from "../Crown";

export interface SimpleCrown {
  plays: number;
  artistName: string;
}

@Entity({ name: "crown_events" })
export class CrownEvent extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  event!: CrownEventString;

  @Column({ nullable: true })
  snatchedEvent!: SnatchedEventString;

  @ManyToOne((_) => Crown, (crown) => crown.history, { eager: true })
  crown!: Crown;

  @Column("simple-json", { nullable: true })
  oldCrown?: SimpleCrown;

  @Column("simple-json")
  newCrown!: SimpleCrown;

  @Column()
  perpetuatorDiscordID!: string;

  @Column()
  perpetuatorUsername!: string;

  @Column({ nullable: true })
  secondaryUserDiscordID?: string;

  @Column({ nullable: true })
  secondaryUsername?: string;

  @CreateDateColumn()
  happenedAt!: Date;
}
