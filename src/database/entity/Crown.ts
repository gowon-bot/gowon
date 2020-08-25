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
import { Message } from "discord.js";
import { CrownState } from "../../services/dbservices/CrownsService";

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

  async refresh(
    options: { onlyIfOwnerIs?: string; logger?: Logger } = {}
  ): Promise<Crown> {
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
    let user = await User.findOne({ where: { discordID, serverID } });

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

  async invalid(
    message: Message
  ): Promise<{
    failed: boolean;
    reason?: CrownState.inactivity | CrownState.left | CrownState.purgatory;
  }> {
    if (!(await this.userStillInServer(message)))
      return { failed: true, reason: CrownState.left };

    if (await this.user.inactive(message))
      return { failed: true, reason: CrownState.inactivity };

    if (await this.user.inPurgatory(message))
      return { failed: true, reason: CrownState.purgatory };

    return { failed: false };
  }

  async userStillInServer(message: Message): Promise<boolean> {
    return await User.stillInServer(message, this.user.discordID);
  }
}
