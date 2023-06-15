import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../User";

@Entity({ name: "community_playlist_submissions" })
export class CommunityPlaylistSubmission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  spotifyURL!: string;

  // Either a name or a user is required to submit
  @Column({ nullable: true })
  submitterUser?: User;

  @Column({ nullable: true })
  submitterName?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
