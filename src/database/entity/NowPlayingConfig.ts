import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "now_playing_config" })
export class NowPlayingConfig extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne((_) => User, { eager: true })
  @JoinColumn()
  user!: User;

  @Column("simple-array")
  config!: string[];
}
