import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "artist_tag_cache" })
export class ArtistTagCache extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  artistName!: string;

  @Column("simple-array")
  tags!: string[];
}
