import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "alternate_album_covers" })
export class AlternateAlbumCover extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  artistName!: string;

  @Column()
  albumName!: string;

  @Column()
  url!: string;

  @ManyToOne((_) => User, { eager: true })
  @JoinColumn({})
  user?: User;

  public get setByModerator(): boolean {
    return !this.user;
  }
}
