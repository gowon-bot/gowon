import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "cached_loved_tracks" })
export class CachedLovedTrack extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne((_) => User, { eager: true })
  @JoinColumn()
  user!: User;

  @Column()
  artist!: string;

  @Column()
  track!: string;

  @Column()
  createdAt: Date = new Date();
}
