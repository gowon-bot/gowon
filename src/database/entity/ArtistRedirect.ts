import { Entity, PrimaryGeneratedColumn, BaseEntity, Column } from "typeorm";

@Entity({ name: "artist_redirects" })
export class ArtistRedirect extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  from!: string;

  @Column()
  to!: string;

  static async check(artistName: string): Promise<ArtistRedirect | undefined> {
    return await this.findOne({ from: artistName });
  }
}
