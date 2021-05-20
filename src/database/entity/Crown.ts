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
import { Logger } from "../../lib/Logger";
import { Message } from "discord.js";
import { CrownState } from "../../services/dbservices/CrownsService";
import { GowonService } from "../../services/GowonService";
import { CrownsQueries } from "../queries";
import { toInt } from "../../helpers/lastFM";
import { LastFMService } from "../../services/LastFM/LastFMService";

export interface CrownRankResponse {
  count: string;
  rank: string;
  totalCount: string;
  totalUsers: string;
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
    discordID: string,
    userIDs?: string[]
  ): Promise<CrownRankResponse> {
    let user = await User.findOne({ where: { discordID } });

    return (
      (
        (await this.query(
          CrownsQueries.rank(userIDs),
          userIDs ? [serverID, user?.id!, userIDs] : [serverID, user?.id!]
        )) as CrownRankResponse[]
      )[0] || {
        count: "0",
        rank: "0",
        totalCount: "0",
        totalUsers: "0",
      }
    );
  }

  static async guildAt(serverID: string, rank: number, userIDs?: string[]) {
    let start = rank < 10 ? 0 : rank - 5;

    let users =
      ((await this.query(
        CrownsQueries.guildAt(userIDs),
        userIDs ? [serverID, start, userIDs] : [serverID, start]
      )) as GuildAroundUser[]) || [];

    return {
      users,
      start,
      end: start + users.length,
    };
  }

  static async guildAround(
    serverID: string,
    discordID: string,
    userIDs?: string[]
  ): Promise<GuildAtResponse> {
    let rank = toInt((await this.rank(serverID, discordID, userIDs)).rank);

    return await this.guildAt(serverID, rank, userIDs);
  }

  static async guild(
    serverID: string,
    limit: number,
    userIDs?: string[]
  ): Promise<RawCrownHolder[]> {
    return (await this.query(
      CrownsQueries.guild(userIDs),
      userIDs ? [serverID, limit, userIDs] : [serverID, limit]
    )) as RawCrownHolder[];
  }

  static async crownRanks(
    serverID: string,
    discordID: string
  ): Promise<CrownRank[]> {
    return (await this.query(CrownsQueries.crownRanks(), [
      serverID,
      discordID,
    ])) as CrownRank[];
  }

  async invalid(message: Message): Promise<{
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
