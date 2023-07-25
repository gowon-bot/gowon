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
import { toInt } from "../../helpers/native/number";
import { SimpleMap } from "../../helpers/types";
import { Logger } from "../../lib/Logger";
import { GowonContext } from "../../lib/context/Context";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { PreviousCrownData } from "../../services/dbservices/crowns/CrownCheck";
import { CrownOptions } from "../../services/dbservices/crowns/CrownsService.types";
import { CrownsQueries } from "../queries";
import { ArtistRedirect } from "./ArtistRedirect";
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

  public async undelete(options: CrownOptions): Promise<Crown> {
    this.user = options.senderDBUser;
    this.plays = options.plays;
    this.lastStolen = new Date();
    this.deletedAt = null;

    return await this.save();
  }

  public asPreviousCrownData(): PreviousCrownData {
    return {
      plays: this.plays,
      ownerDiscordID: this.user.discordID,
    };
  }

  // static methods
  public static async createNew(
    ctx: GowonContext,
    options: CrownOptions,
    redirect: ArtistRedirect
  ): Promise<Crown> {
    const newCrown = Crown.create({
      artistName: options.artistName,
      plays: options.plays,
      user: options.senderDBUser,
      serverID: ctx.requiredGuild.id,
      version: 0,
      lastStolen: new Date(),
      redirectedFrom: redirect,
    } as SimpleMap);

    return await newCrown.save();
  }

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

  redirectDisplay(): string {
    return this.redirectedFrom
      ? ` (_redirected from ${this.redirectedFrom}_)`
      : "";
  }
}
