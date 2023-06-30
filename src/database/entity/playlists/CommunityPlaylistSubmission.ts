import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../User";
import { CommunityPlaylist } from "./CommunityPlaylist";

@Entity({ name: "community_playlist_submissions" })
export class CommunityPlaylistSubmission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  spotifyURL!: string;

  @ManyToOne((_) => CommunityPlaylist, (playlist) => playlist.submissions, {
    eager: true,
  })
  playlist!: CommunityPlaylist;

  // Either a name or a user is required to submit
  @ManyToOne((_) => User, (user) => user.playlistSubmissions, {
    eager: true,
    nullable: true,
  })
  submitterUser?: User;

  @Column({ nullable: true })
  submitterName?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
