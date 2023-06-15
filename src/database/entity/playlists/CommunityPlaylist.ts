import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

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
}
