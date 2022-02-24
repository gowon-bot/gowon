import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "spotify_playlist_tags" })
export class SpotifyPlaylistTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne((_) => User, (user) => user.crowns, { eager: true })
  user!: User;

  @Column()
  playlistID!: string;

  @Column()
  playlistName!: string;

  @Column()
  emoji!: string;
}
