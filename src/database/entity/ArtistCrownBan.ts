import { Entity, PrimaryGeneratedColumn, BaseEntity, Column } from "typeorm";

@Entity({ name: "artist_crown_bans" })
export class ArtistCrownBan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  serverID!: string;

  @Column()
  artistName!: string;
}
