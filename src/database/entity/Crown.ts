import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { LastFMService } from "../../services/LastFMService";
import { Logger } from "../../lib/Logger";

export interface CrownRankResponse {
  count: string;
  rank: string;
}

@Entity({ name: "crowns" })
export class Crown extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  serverID!: string;

  @ManyToOne((_) => User, (user) => user.crowns, { eager: true })
  user!: User;

  @Column()
  artistName!: string;

  @Column()
  plays!: number;

  @Column()
  version!: number;

  @Column()
  lastStolen!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  async refresh(options: { onlyIfOwnerIs?: string, logger?: Logger } = {}): Promise<Crown> {
    if (
      !options.onlyIfOwnerIs ||
      options.onlyIfOwnerIs === this.user.discordID
    ) {
      this.plays = await new LastFMService(options.logger).getArtistPlays(
        this.user.lastFMUsername,
        this.artistName
      );
      await this.save();
    }
    return this;
  }

  // static methods
  static async getCrown(
    serverID: string,
    artistName: string
  ): Promise<Crown | undefined> {
    return await Crown.findOne({ where: { serverID, artistName } });
  }

  static async rank(
    serverID: string,
    discordID: string
  ): Promise<CrownRankResponse> {
    let user = await User.findOne({ where: { discordID } });

    return ((await this.query(
      `SELECT count, rank FROM (
      SELECT *, ROW_NUMBER() OVER (
      ORDER BY count DESC
  ) AS rank FROM (
      SELECT
          count(id) AS count,
          "userId"
      FROM crowns
      WHERE crowns."serverID" LIKE $1
      GROUP BY "userId"
      ORDER BY 1 desc
  ) t
  LEFT JOIN (
      SELECT * FROM users WHERE users."serverID" LIKE $1
    ) u    
      ON u.id = t."userId"
) ranks
WHERE "userId" = $2
`,
      [serverID, user?.id!]
    )) as CrownRankResponse[])[0];
  }
}
