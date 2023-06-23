import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CommunityPlaylistSubmission } from "./CommunityPlaylistSubmission";

@Entity({ name: "community_playlists" })
export class CommunityPlaylist extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column()
  guildID!: string;

  @Column({ nullable: true })
  listeningTime?: Date;

  @Column({ nullable: true })
  listeningChannelID?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(
    (_) => CommunityPlaylistSubmission,
    (submission) => submission.playlist
  )
  submissions!: CommunityPlaylistSubmission[];
}
