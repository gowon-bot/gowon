import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  BaseEntity,
  DeleteDateColumn,
} from "typeorm";
import { User } from "./User";
import { CrownEvent } from "./meta/CrownEvent";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { Logger } from "../../lib/Logger";
import { Message } from "discord.js";
import { CrownState } from "../../services/dbservices/CrownsService";
import { GowonService } from "../../services/GowonService";

export interface CrownRankResponse {
  count: string;
  rank: string;
}

export interface GuildAroundUser {
  count: string;
  rank: string;
  discordID: string;
}

export interface GuildAtResponse {
  users: GuildAroundUser[];
  start: number;
  end: number;
}

interface RawCrownHolder {
  userId: number;
  discordID: string;
  count: string;
}

export type InvalidCrownState =
  | CrownState.inactivity
  | CrownState.left
  | CrownState.purgatory
  | CrownState.banned;

@Entity({ name: "crowns" })
export class Crown extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  serverID!: string;

  @ManyToOne((_) => User, (user) => user.crowns, { eager: true })
  user!: User;

  @OneToMany((_) => CrownEvent, (crownEvent) => crownEvent.crown)
  history!: CrownEvent[];

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

  @DeleteDateColumn()
  deletedAt?: Date | null;

  // Set when redirected
  redirectedFrom?: string;

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
    let user = await User.findOne({ where: { discordID } });

    return (
      ((await this.query(
        `SELECT count, rank FROM (
        SELECT *, ROW_NUMBER() OVER (
          ORDER BY count DESC
        ) AS rank FROM (
            SELECT
                count(id) AS count,
                "userId"
            FROM crowns
            WHERE crowns."serverID" LIKE $1
              AND crowns."deletedAt" IS NULL
            GROUP BY "userId"
            ORDER BY 1 desc
        ) t
        LEFT JOIN users u
          ON u.id = t."userId"
      ) ranks
      WHERE "userId" = $2
`,
        [serverID, user?.id!]
      )) as CrownRankResponse[])[0] || { count: "0", rank: "0" }
    );
  }

  static async guildAt(serverID: string, rank: number) {
    let start = rank < 10 ? 0 : rank - 5;

    let users =
      ((await this.query(
        `SELECT count, rank, "discordID" FROM (
        SELECT *, ROW_NUMBER() OVER (
          ORDER BY count DESC
        ) AS rank FROM (
            SELECT
                count(id) AS count,
                "userId"
            FROM crowns
            WHERE crowns."serverID" LIKE $1
              AND crowns."deletedAt" IS NULL
            GROUP BY "userId"
            ORDER BY 1 desc
        ) t
        LEFT JOIN users u
          ON u.id = t."userId"
      ) ranks
      OFFSET $2
      LIMIT 10`,
        [serverID, start]
      )) as GuildAroundUser[]) || [];

    return {
      users,
      start,
      end: start + 10,
    };
  }

  static async guildAround(
    serverID: string,
    discordID: string
  ): Promise<GuildAtResponse> {
    let rank = (await this.rank(serverID, discordID)).rank.toInt();

    return await this.guildAt(serverID, rank);
  }

  static async guild(
    serverID: string,
    limit: number
  ): Promise<RawCrownHolder[]> {
    return (await this.query(
      `SELECT
        count(*) AS count,
        "userId",
        "discordID"
      FROM crowns c
      LEFT JOIN users u
        ON u.id = "userId"
      WHERE c."serverID" LIKE $1
        AND c."deletedAt" IS NULL
      GROUP BY "userId", "discordID"
      ORDER BY count DESC
      LIMIT $2`,
      [serverID, limit]
    )) as RawCrownHolder[];
  }

  async invalid(
    message: Message
  ): Promise<{
    failed: boolean;
    reason?: InvalidCrownState;
  }> {
    if (!(await this.userStillInServer(message)))
      return { failed: true, reason: CrownState.left };

    if (await this.user.inactive(message))
      return { failed: true, reason: CrownState.inactivity };

    if (await this.user.inPurgatory(message))
      return { failed: true, reason: CrownState.purgatory };

    if (
      await GowonService.getInstance().isUserCrownBanned(
        message.guild!,
        this.user.discordID
      )
    )
      return { failed: true, reason: CrownState.banned };

    return { failed: false };
  }

  async userStillInServer(message: Message): Promise<boolean> {
    return await User.stillInServer(message, this.user.discordID);
  }

  redirectDisplay(): string {
    return this.redirectedFrom
      ? ` (_redirected from ${this.redirectedFrom}_)`
      : "";
  }
}
