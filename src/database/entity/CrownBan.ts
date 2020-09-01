import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "crown_bans" })
export class CrownBan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  serverID!: string;

  @OneToOne((_) => User, { eager: true })
  @JoinColumn()
  user!: User;
}
