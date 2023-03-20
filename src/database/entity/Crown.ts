import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { toInt } from "../../helpers/lastfm/";
import { Logger } from "../../lib/Logger";
import { GowonContext } from "../../lib/context/Context";
import { GowonService } from "../../services/GowonService";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { CrownState } from "../../services/dbservices/CrownsService";
import { CrownsQueries } from "../queries";
import { User } from "./User";
import { CrownEvent } from "./meta/CrownEvent";

export interface CrownRankResponse {
  count: number;
  rank: number;
  totalCount: number;
  totalUsers: number;
}

export interface GuildAroundUser {
  count: number;
  rank: number;
  discordID: string;
}

export interface GuildAtResponse {
  users: GuildAroundUser[];
  start: number;
  end: number;
}

export interface RawCrownHolder {
  userId: number;
  discordID: string;
  count: string;
}

export interface CrownRank {
  artistName: string;
  rank: string;
  plays: string;
}

export type InvalidCrownState =
  | CrownState.inactivity
  | CrownState.left
  | CrownState.purgatory
  | CrownState.banned
  | CrownState.loggedOut;

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
      this.plays = await ServiceRegistry.get(LastFMService).getArtistPlays(
        { logger: options.logger } as any,
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
    return (await Crown.findOneBy({ serverID, artistName })) ?? undefined;
  }

  static async rank(
    serverID: string,
    userID: number,
    userIDs?: string[]
  ): Promise<CrownRankResponse> {
    const variables = userIDs
      ? [serverID, userID, userIDs]
      : [serverID, userID];

    const queryResponse = await this.query(
      CrownsQueries.rank(userIDs),
      variables
    );

    if (queryResponse[0]) {
      const ranking = queryResponse[0];

      return {
        count: toInt(ranking.count),
        rank: toInt(ranking.rank),
        totalCount: toInt(ranking.totalCount),
        totalUsers: toInt(ranking.totalUsers),
      };
    }

    const noRank = {
      count: 0,
      rank: 0,
      totalCount: 0,
      totalUsers: 0,
    };

    return noRank;
  }

  static async guildAt(serverID: string, rank: number, userIDs?: string[]) {
    const start = rank < 10 ? 0 : rank - 5;

    const rawUsers: Array<Record<string, string>> =
      (await this.query(
        CrownsQueries.guildAt(userIDs),
        userIDs ? [serverID, start, userIDs] : [serverID, start]
      )) || [];

    const users: GuildAroundUser[] = rawUsers.map((u) => ({
      discordID: u.discordID as string,
      count: toInt(u.count),
      rank: toInt(u.rank),
    }));

    return {
      users,
      start,
      end: start + users.length,
    };
  }

  static async guildAround(
    serverID: string,
    userID: number,
    userIDs?: string[]
  ): Promise<GuildAtResponse> {
    const rank = (await this.rank(serverID, userID, userIDs)).rank;

    return await this.guildAt(serverID, toInt(rank), userIDs);
  }

  static async guild(
    serverID: string,
    userIDs?: string[]
  ): Promise<RawCrownHolder[]> {
    return (await this.query(
      CrownsQueries.guild(userIDs),
      userIDs ? [serverID, userIDs] : [serverID]
    )) as RawCrownHolder[];
  }

  static async crownRanks(
    serverID: string,
    userID: number
  ): Promise<CrownRank[]> {
    return await this.query(CrownsQueries.crownRanks(), [serverID, userID]);
  }

  async invalid(ctx: GowonContext): Promise<{
    failed: boolean;
    reason?: InvalidCrownState;
  }> {
    if (!this.user.lastFMUsername)
      return { failed: true, reason: CrownState.loggedOut };

    if (!(await this.userStillInServer(ctx)))
      return { failed: true, reason: CrownState.left };

    if (await this.user.inactive(ctx))
      return { failed: true, reason: CrownState.inactivity };

    if (await this.user.inPurgatory(ctx))
      return { failed: true, reason: CrownState.purgatory };

    if (
      await ServiceRegistry.get(GowonService).isUserCrownBanned(
        ctx.guild!,
        this.user.discordID
      )
    )
      return { failed: true, reason: CrownState.banned };

    return { failed: false };
  }

  async userStillInServer(ctx: GowonContext): Promise<boolean> {
    return await User.stillInServer(ctx, this.user.discordID);
  }

  redirectDisplay(): string {
    return this.redirectedFrom
      ? ` (_redirected from ${this.redirectedFrom}_)`
      : "";
  }
}
