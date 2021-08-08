import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "combos" })
export class Combo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne((_) => User, (user) => user.combos, { eager: true })
  user!: User;

  @Column()
  artistPlays?: number;

  @Column()
  artistName?: string;

  @Column()
  albumPlays?: number;

  @Column()
  albumName?: string;

  @Column()
  trackPlays?: number;

  @Column()
  trackName?: string;

  @Column()
  firstScrobble!: Date;

  @Column()
  lastScrobble!: Date;
}
