import { isBefore, sub } from "date-fns";
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
  public new = false;

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

  isPending(): boolean {
    return isBefore(this.createdAt, sub(this.createdAt, { days: 2 }));
  }

  isExpired(): boolean {
    return isBefore(this.createdAt, sub(this.createdAt, { days: 10 }));
  }
}
