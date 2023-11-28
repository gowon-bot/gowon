import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Image } from "../../lib/views/Image";
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

  public get image(): Image {
    return new Image({
      url: this.url,
      metadata: { artist: this.artistName, album: this.albumName },
    });
  }
}
