import { FindManyOptions, In, MoreThan } from "typeorm";
import { ArtistCrownBan } from "../../../database/entity/ArtistCrownBan";
import {
  Crown,
  CrownRank,
  CrownRankResponse,
  GuildAtResponse,
} from "../../../database/entity/Crown";
import { CrownBan } from "../../../database/entity/CrownBan";
import { Setting } from "../../../database/entity/Setting";
import { User } from "../../../database/entity/User";
import {
  AlreadyCrownBannedError,
  ArtistAlreadyCrownBannedError,
  ArtistNotCrownBannedError,
  NotCrownBannedError,
} from "../../../errors/crowns";
import { asyncMap } from "../../../helpers";
import { toInt } from "../../../helpers/lastfm";
import { constants } from "../../../lib/constants";
import { GowonContext } from "../../../lib/context/Context";
import { SettingsService } from "../../../lib/settings/SettingsService";
import { ServiceRegistry } from "../../ServicesRegistry";
import { CrownsCheckService } from "./CrownsCheckService";
import { CrownsHistoryService } from "./CrownsHistoryService";
import { CrownDisplay, CrownHolder } from "./CrownsService.types";

export class CrownsService extends CrownsCheckService {
  public get scribe() {
    return ServiceRegistry.get(CrownsHistoryService);
  }

  private get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }

  get threshold() {
    return constants.crownThreshold;
  }

  async killCrown(ctx: GowonContext, artistName: string) {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, `Killing crown for ${artistName} in ${serverID}`);
    let crown = await Crown.findOneBy({ artistName, serverID });

    if (crown) await Crown.softRemove(crown);
  }

  async getCrownDisplay(
    ctx: GowonContext,
    artistName: string
  ): Promise<CrownDisplay | undefined> {
    let crown = await this.getCrown(ctx, artistName, {
      showDeleted: false,
      refresh: false,
    });

    if (!crown) return;

    let user = await crown.user.toDiscordUser(ctx.requiredGuild);

    return { crown, user };
  }

  async listTopCrowns(
    ctx: GowonContext,
    userID: number,
    limit = 10
  ): Promise<Crown[]> {
    const serverID = ctx.requiredGuild.id;

    this.log(
      ctx,
      "Listing crowns for user " + userID + " in server " + serverID
    );

    const options: FindManyOptions = {
      where: { user: { id: userID }, serverID },
      order: { plays: "DESC" },
    };

    if (limit > 0) options.take = limit;

    return await Crown.find(options);
  }

  async listTopCrownsInServer(
    ctx: GowonContext,
    limit = 10,
    userIDs?: string[]
  ): Promise<Crown[]> {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, "Listing crowns in server " + serverID);

    return await Crown.find(
      await this.filterByDiscordID(
        {
          where: { serverID },
          order: { plays: "DESC" },
          take: limit === -1 ? undefined : limit,
        },
        userIDs
      )
    );
  }

  async count(ctx: GowonContext, userID: number): Promise<number> {
    const serverID = ctx.requiredGuild.id;

    this.log(
      ctx,
      "Counting crowns for user " + userID + " in server " + serverID
    );

    return await Crown.countBy({ user: { id: userID }, serverID });
  }

  async getRank(
    ctx: GowonContext,
    userID: number,
    userIDs?: string[]
  ): Promise<CrownRankResponse> {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, "Ranking user " + userID + " in server " + serverID);

    return await Crown.rank(serverID, userID, userIDs);
  }

  async countAllInServer(
    ctx: GowonContext,
    userIDs?: string[]
  ): Promise<number> {
    const serverID = ctx.requiredGuild.id;
    this.log(ctx, "Counting crowns for server " + serverID);

    return await Crown.count(
      await this.filterByDiscordID(
        {
          where: { serverID },
        },
        userIDs
      )
    );
  }

  async listContentiousCrownsInServer(
    ctx: GowonContext,
    limit = 10,
    userIDs?: string[]
  ): Promise<Crown[]> {
    const serverID = ctx.requiredGuild.id;
    this.log(ctx, "Listing contentious crowns in server " + serverID);

    const findOptions = await this.filterByDiscordID(
      {
        where: { serverID, version: MoreThan(0) },
        order: { version: "DESC" },
        take: limit,
      },
      userIDs
    );

    return await Crown.find(findOptions);
  }

  async listRecentlyStolen(
    ctx: GowonContext,
    limit = 10,
    userIDs?: string[]
  ): Promise<Crown[]> {
    const serverID = ctx.requiredGuild.id;
    this.log(ctx, "Listing recently stolen crowns in server " + serverID);

    return await Crown.find(
      await this.filterByDiscordID(
        {
          where: { serverID, version: MoreThan(0) },
          order: { lastStolen: "DESC" },
          take: limit,
        },
        userIDs
      )
    );
  }

  async guildLeaderboard(
    ctx: GowonContext,
    userIDs?: string[]
  ): Promise<CrownHolder[]> {
    const guild = ctx.requiredGuild;

    this.log(ctx, "Listing top crown holders in server " + guild.id);

    const users = await Crown.guild(guild.id, userIDs);

    return await asyncMap(users, async (rch) => ({
      user: (await User.toDiscordUser(guild, rch.discordID))!,
      numberOfCrowns: toInt(rch.count),
    }));
  }

  async setInactiveRole(
    ctx: GowonContext,
    roleID?: string
  ): Promise<Setting | undefined> {
    const guildID = ctx.requiredGuild.id;

    const setting = await this.settingsService.set(
      ctx,
      "inactiveRole",
      { guildID },
      roleID
    );

    return setting;
  }

  async setPurgatoryRole(
    ctx: GowonContext,
    roleID?: string
  ): Promise<Setting | undefined> {
    const guildID = ctx.requiredGuild.id;

    const setting = await this.settingsService.set(
      ctx,
      "purgatoryRole",
      { guildID },
      roleID
    );

    return setting;
  }

  private async wipeUsersCrowns(
    ctx: GowonContext,
    userID: string
  ): Promise<number> {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, `Wiping crowns for user ${userID} in ${serverID}`);

    const user = await User.findOneBy({ discordID: userID });

    if (user) {
      const crown = await Crown.findBy({ serverID, user: { id: user.id } });
      const result = await Crown.softRemove(crown);

      return result.length;
    } else {
      return 0;
    }
  }

  async optOut(ctx: GowonContext, userID: string): Promise<number> {
    const guildID = ctx.requiredGuild.id;

    this.log(ctx, `Opting out user ${userID} out of crowns in ${guildID}`);

    await this.settingsService.set(
      ctx,
      "optedOut",
      {
        guildID,
        userID,
      },
      "true"
    );

    return await this.wipeUsersCrowns(ctx, userID);
  }

  async optIn(ctx: GowonContext, userID: string): Promise<void> {
    const guildID = ctx.requiredGuild.id;

    this.log(ctx, `Opting in user ${userID} out of crowns in ${guildID}`);

    this.settingsService.set(ctx, "optedOut", {
      guildID,
      userID,
    });
  }

  async isUserOptedOut(ctx: GowonContext, userID: string): Promise<boolean> {
    const guildID = ctx.requiredGuild.id;

    this.log(ctx, `Checking if ${userID} is opted out in ${guildID}`);

    const setting = this.settingsService.get("optedOut", {
      guildID,
      userID,
    });

    return !!setting;
  }

  async banUser(ctx: GowonContext, user: User): Promise<CrownBan> {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, `Crown banning user ${user.discordID} in ${serverID}`);

    const existingCrownBan = await CrownBan.findOneBy({
      user: { id: user.id },
    });

    if (existingCrownBan) throw new AlreadyCrownBannedError();

    const crownBan = CrownBan.create({ user, serverID });
    await crownBan.save();

    this.gowonService.cache.addCrownBan(serverID, user.discordID);

    return crownBan;
  }

  async unbanUser(ctx: GowonContext, user: User): Promise<void> {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, `Crown unbanning user ${user.discordID} in ${serverID}`);

    const crownBan = await CrownBan.findOneBy({ user: { id: user.id } });

    if (!crownBan) throw new NotCrownBannedError();

    await crownBan.remove();

    this.gowonService.cache.removeCrownBan(serverID, user.discordID);
  }

  async getCrownBannedUsers(ctx: GowonContext): Promise<CrownBan[]> {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, `Fetching crown banned users for server ${serverID}`);

    return await CrownBan.findBy({ serverID });
  }

  async guildAround(
    ctx: GowonContext,
    serverID: string,
    userID: number,
    userIDs?: string[]
  ): Promise<GuildAtResponse> {
    this.log(
      ctx,
      `Fetching guild around user ${userID} for server ${serverID}`
    );

    return await Crown.guildAround(serverID, userID, userIDs);
  }

  async guildAt(
    ctx: GowonContext,
    rank: number,
    userIDs?: string[]
  ): Promise<GuildAtResponse> {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, `Fetching guild at ${rank} for server ${serverID}`);

    return await Crown.guildAt(serverID, rank, userIDs);
  }

  async crownRanks(ctx: GowonContext, userID: number): Promise<CrownRank[]> {
    const serverID = ctx.requiredGuild.id;

    return await Crown.crownRanks(serverID, userID);
  }

  async artistCrownBan(
    ctx: GowonContext,
    artistName: string
  ): Promise<ArtistCrownBan> {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, `Crown banning artist ${artistName} in ${serverID}`);

    const existingCrownBan = await ArtistCrownBan.findOneBy({
      artistName,
      serverID,
    });

    if (existingCrownBan) throw new ArtistAlreadyCrownBannedError();

    const crownBan = ArtistCrownBan.create({ artistName, serverID });
    await crownBan.save();

    this.gowonService.cache.addCrownArtistBan(serverID, crownBan.artistName);

    return crownBan;
  }

  async artistCrownUnban(
    ctx: GowonContext,
    artistName: string
  ): Promise<ArtistCrownBan> {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, `Crown unbanning artist ${artistName} in ${serverID}`);

    const crownBan = await ArtistCrownBan.findOneBy({
      artistName,
      serverID,
    });

    if (!crownBan) throw new ArtistNotCrownBannedError();

    await crownBan.remove();

    this.gowonService.cache.removeCrownArtistBan(serverID, artistName);

    return crownBan;
  }

  private async filterByDiscordID(
    findOptions: Record<string, any>,
    userIDs?: string[]
  ): Promise<any> {
    if (!userIDs) return findOptions;

    const dbUserIDs = (await User.findBy({ discordID: In(userIDs) })).map(
      (u) => u.id
    );

    const filter = { user: In(dbUserIDs) };

    if (findOptions.where) {
      findOptions.where = Object.assign(findOptions.where, filter);
    } else {
      findOptions = Object.assign(findOptions, filter);
    }

    return findOptions;
  }
}
