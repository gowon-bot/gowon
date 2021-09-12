import {
  Crown,
  CrownRank,
  CrownRankResponse,
  GuildAtResponse,
  InvalidCrownState,
} from "../../database/entity/Crown";
import { User } from "../../database/entity/User";
import {
  AlreadyBannedError,
  ArtistAlreadyCrownBannedError,
  ArtistCrownBannedError,
  ArtistNotCrownBannedError,
  NotBannedError,
  RecordNotFoundError,
} from "../../errors";
import { User as DiscordUser } from "discord.js";
import { BaseService, BaseServiceContext } from "../BaseService";
import { FindManyOptions, ILike, In } from "typeorm";
import { Setting } from "../../database/entity/Setting";
import { MoreThan } from "typeorm";
import { CrownBan } from "../../database/entity/CrownBan";
import { CacheScopedKey } from "../../database/cache/ShallowCache";
import { RedirectsService } from "./RedirectsService";
import { ArtistRedirect } from "../../database/entity/ArtistRedirect";
import { ArtistCrownBan } from "../../database/entity/ArtistCrownBan";
import { toInt } from "../../helpers/lastFM";
import { ServiceRegistry } from "../ServicesRegistry";
import { GowonService } from "../GowonService";
import { CrownsHistoryService } from "./CrownsHistoryService";

export enum CrownState {
  tie = "Tie",
  snatched = "Snatched",
  fail = "Fail",
  newCrown = "New crown",
  updated = "Updated",
  tooLow = "Too low",
  inactivity = "Inactivity",
  purgatory = "Purgatory",
  left = "Left",
  banned = "Banned",
  loggedOut = "Logged out",
}

export interface CrownCheck {
  crown?: Crown;
  oldCrown?: Crown;
  state: CrownState;
  artistName: string;
  redirect: ArtistRedirect;
}

export interface CrownOptions {
  artistName: string;
  plays: number;
}

export interface CrownHolder {
  user: DiscordUser;
  numberOfCrowns: number;
}

export interface CrownDisplay {
  crown: Crown;
  user?: DiscordUser;
}

export class CrownsService extends BaseService {
  public get scribe() {
    return ServiceRegistry.get(CrownsHistoryService);
  }
  private get redirectsService() {
    return ServiceRegistry.get(RedirectsService);
  }
  private get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  get threshold() {
    return this.gowonService.constants.crownThreshold;
  }

  async checkCrown(
    ctx: BaseServiceContext,
    crownOptions: CrownOptions
  ): Promise<CrownCheck> {
    const { artistName, plays } = crownOptions;
    const message = ctx.command.message;
    const author = this.author(ctx);
    const guild = this.guild(ctx);

    this.log(
      ctx,
      `Checking crown for user ${author.id} and artist ${artistName}`
    );

    let redirect = (await this.redirectsService.getRedirect(ctx, artistName))!;

    let redirectedArtistName = redirect.to || redirect.from;

    if (
      await this.gowonService.isArtistCrownBanned(guild!, redirectedArtistName)
    ) {
      throw new ArtistCrownBannedError(redirectedArtistName);
    }

    let [crown, user] = await Promise.all([
      this.getCrown(ctx, redirectedArtistName, {
        showDeleted: true,
        noRedirect: true,
      }),
      User.findOne({ where: { discordID: author.id } }),
    ]);

    if (redirect.to && crown) {
      crown.redirectedFrom = redirect.from;
    }

    let oldCrown = Object.assign({}, crown);
    oldCrown.user = Object.assign({}, crown?.user);

    if (!user) throw new RecordNotFoundError("user");

    let crownState: CrownState;

    if (crown && !crown.deletedAt) {
      let invalidCheck = await crown.invalid(message);

      if (invalidCheck.failed) {
        return {
          ...(await this.handleInvalidHolder(
            crown,
            invalidCheck.reason!,
            plays,
            user,
            redirectedArtistName,
            redirect
          )),
          oldCrown,
        };
      }

      if (crown.user.id === user.id) {
        crownState = await this.handleSelfCrown(crown, plays);
      } else {
        crown = await crown.refresh({ logger: ctx.logger });
        oldCrown.plays = crown.plays;
        crownState = await this.handleCrown(crown, plays, user);
      }

      return {
        crown: crown,
        state: crownState,
        oldCrown,
        artistName: redirectedArtistName,
        redirect,
      };
    } else {
      if (plays < this.threshold)
        return {
          state: CrownState.tooLow,
          artistName: redirectedArtistName,
          redirect,
        };
      this.log(
        ctx,
        "Creating crown for " + redirectedArtistName + " in server " + guild.id!
      );

      let newCrown = await this.handleNewCrown(
        ctx,
        {
          user,
          plays,
          artistName: redirectedArtistName,
        },
        crown
      );

      return {
        crown: newCrown,
        state: CrownState.newCrown,
        oldCrown,
        artistName: redirectedArtistName,
        redirect,
      };
    }
  }

  async getCrown(
    ctx: BaseServiceContext,
    artistName: string,
    options: {
      refresh?: boolean;
      requester?: DiscordUser;
      showDeleted?: boolean;
      noRedirect?: boolean;
      caseSensitive?: boolean;
    } = { refresh: false, showDeleted: true, noRedirect: false }
  ): Promise<Crown | undefined> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Fetching crown for ${artistName} in ${serverID}`);

    let crownArtistName = artistName;
    let redirectedFrom: string | undefined = undefined;

    if (!options.noRedirect) {
      let redirect = await this.redirectsService.getRedirect(ctx, artistName);

      if (redirect?.to) {
        redirectedFrom = redirect.from;
        crownArtistName = redirect.to || redirect.from;
      }
    }

    let crown = await Crown.findOne({
      where: {
        artistName: options.caseSensitive
          ? crownArtistName
          : ILike(crownArtistName),
        serverID,
      },
      withDeleted: options.showDeleted,
    });

    if (crown) crown.redirectedFrom = redirectedFrom;

    return options.refresh
      ? await crown?.refresh({
          onlyIfOwnerIs: options.requester?.id,
          logger: ctx.logger,
        })
      : crown;
  }

  async killCrown(ctx: BaseServiceContext, artistName: string) {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Killing crown for ${artistName} in ${serverID}`);
    let crown = await Crown.findOne({ where: { artistName, serverID } });

    if (crown) await Crown.softRemove(crown);
  }

  async getCrownDisplay(
    ctx: BaseServiceContext,
    artistName: string
  ): Promise<CrownDisplay | undefined> {
    let crown = await this.getCrown(ctx, artistName, {
      showDeleted: false,
      refresh: false,
    });

    if (!crown) return;

    let user = await crown.user.toDiscordUser(this.guild(ctx));

    return { crown, user };
  }

  async listTopCrowns(
    ctx: BaseServiceContext,
    discordID: string,
    limit = 10
  ): Promise<Crown[]> {
    const serverID = this.guild(ctx).id;

    this.log(
      ctx,
      "Listing crowns for user " + discordID + " in server " + serverID
    );
    let user = await User.findOne({ where: { discordID } });

    if (!user) throw new RecordNotFoundError("user");

    let options: FindManyOptions = {
      where: { user, serverID },
      order: { plays: "DESC" },
    };

    if (limit > 0) options.take = limit;

    return await Crown.find(options);
  }

  async listTopCrownsInServer(
    ctx: BaseServiceContext,
    limit = 10,
    userIDs?: string[]
  ): Promise<Crown[]> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, "Listing crowns in server " + serverID);

    return await Crown.find(
      await this.filterByDiscordID(
        {
          where: { serverID },
          order: { plays: "DESC" },
          take: limit,
        },
        userIDs
      )
    );
  }

  async count(ctx: BaseServiceContext, discordID: string): Promise<number> {
    const serverID = this.guild(ctx).id;

    this.log(
      ctx,
      "Counting crowns for user " + discordID + " in server " + serverID
    );
    let user = await User.findOne({
      where: { discordID },
    });

    if (!user) throw new RecordNotFoundError("user");

    return await Crown.count({ where: { user, serverID } });
  }

  async getRank(
    ctx: BaseServiceContext,
    discordID: string,
    userIDs?: string[]
  ): Promise<CrownRankResponse> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, "Ranking user " + discordID + " in server " + serverID);
    let user = await User.findOne({ where: { discordID } });

    if (!user) throw new RecordNotFoundError("user");

    return await Crown.rank(serverID, discordID, userIDs);
  }

  async countAllInServer(
    ctx: BaseServiceContext,
    userIDs?: string[]
  ): Promise<number> {
    const serverID = this.guild(ctx).id;
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
    ctx: BaseServiceContext,
    limit = 10,
    userIDs?: string[]
  ): Promise<Crown[]> {
    const serverID = this.guild(ctx).id;
    this.log(ctx, "Listing contentious crowns in server " + serverID);

    return await Crown.find(
      await this.filterByDiscordID(
        {
          where: { serverID },
          order: { version: "DESC" },
          take: limit,
        },
        userIDs
      )
    );
  }

  async listRecentlyStolen(
    ctx: BaseServiceContext,
    limit = 10,
    userIDs?: string[]
  ): Promise<Crown[]> {
    const serverID = this.guild(ctx).id;
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
    ctx: BaseServiceContext,
    limit = 10,
    userIDs?: string[]
  ): Promise<CrownHolder[]> {
    const guild = this.guild(ctx);

    this.log(ctx, "Listing top crown holders in server " + guild.id);

    let users = await Crown.guild(guild.id, limit, userIDs);

    return await Promise.all(
      users.map(async (rch) => ({
        user: (await User.toDiscordUser(guild, rch.discordID))!,
        numberOfCrowns: toInt(rch.count),
      }))
    );
  }

  async setInactiveRole(
    ctx: BaseServiceContext,
    roleID?: string
  ): Promise<Setting | undefined> {
    const guildID = this.guild(ctx).id;

    const setting = await this.gowonService.settingsManager.set(
      "inactiveRole",
      { guildID },
      roleID
    );

    return setting;
  }

  async setPurgatoryRole(
    ctx: BaseServiceContext,
    roleID?: string
  ): Promise<Setting | undefined> {
    const guildID = this.guild(ctx).id;

    const setting = await this.gowonService.settingsManager.set(
      "purgatoryRole",
      { guildID },
      roleID
    );

    return setting;
  }

  private async wipeUsersCrowns(
    ctx: BaseServiceContext,
    userID: string
  ): Promise<number> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Wiping crowns for user ${userID} in ${serverID}`);

    const user = await User.findOne({ where: { discordID: userID } });

    const crown = await Crown.find({ serverID, user });
    const result = await Crown.softRemove(crown);

    return result.length;
  }

  async optOut(ctx: BaseServiceContext, userID: string): Promise<number> {
    const guildID = this.guild(ctx).id;

    this.log(ctx, `Opting out user ${userID} out of crowns in ${guildID}`);

    await this.gowonService.settingsManager.set(
      "optedOut",
      {
        guildID,
        userID,
      },
      "true"
    );

    return await this.wipeUsersCrowns(ctx, userID);
  }

  async optIn(ctx: BaseServiceContext, userID: string): Promise<void> {
    const guildID = this.guild(ctx).id;

    this.log(ctx, `Opting in user ${userID} out of crowns in ${guildID}`);

    this.gowonService.settingsManager.set("optedOut", {
      guildID,
      userID,
    });
  }

  async isUserOptedOut(
    ctx: BaseServiceContext,
    userID: string
  ): Promise<boolean> {
    const guildID = this.guild(ctx).id;

    this.log(ctx, `Checking if ${userID} is opted out in ${guildID}`);

    const setting = this.gowonService.settingsManager.get("optedOut", {
      guildID,
      userID,
    });

    return !!setting;
  }

  async banUser(ctx: BaseServiceContext, user: User): Promise<CrownBan> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Crown banning user ${user.discordID} in ${serverID}`);

    let existingCrownBan = await CrownBan.findOne({ user });

    if (existingCrownBan) throw new AlreadyBannedError();

    let crownBan = CrownBan.create({ user, serverID });
    await crownBan.save();

    let bans = [
      ...(this.gowonService.shallowCache.find(
        CacheScopedKey.CrownBannedUsers,
        serverID
      ) || []),
      user.discordID,
    ];

    this.gowonService.shallowCache.remember(
      CacheScopedKey.CrownBannedUsers,
      bans,
      serverID
    );

    return crownBan;
  }

  async unbanUser(ctx: BaseServiceContext, user: User): Promise<void> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Crown unbanning user ${user.discordID} in ${serverID}`);

    let crownBan = await CrownBan.findOne({ user });

    if (!crownBan) throw new NotBannedError();

    await crownBan.remove();

    let bans = (
      this.gowonService.shallowCache.find<string[]>(
        CacheScopedKey.CrownBannedUsers,
        serverID
      ) || []
    ).filter((u) => u !== user.discordID);

    this.gowonService.shallowCache.remember(
      CacheScopedKey.CrownBannedUsers,
      bans,
      serverID
    );
  }

  async getCrownBannedUsers(ctx: BaseServiceContext): Promise<CrownBan[]> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Fetching crown banned users for server ${serverID}`);

    return await CrownBan.find({
      where: { user: { serverID } },
    });
  }

  async guildAround(
    ctx: BaseServiceContext,
    serverID: string,
    discordID: string,
    userIDs?: string[]
  ): Promise<GuildAtResponse> {
    this.log(
      ctx,
      `Fetching guild around user ${discordID} for server ${serverID}`
    );

    return await Crown.guildAround(serverID, discordID, userIDs);
  }

  async guildAt(
    ctx: BaseServiceContext,
    rank: number,
    userIDs?: string[]
  ): Promise<GuildAtResponse> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Fetching guild at ${rank} for server ${serverID}`);

    return await Crown.guildAt(serverID, rank, userIDs);
  }

  async crownRanks(
    ctx: BaseServiceContext,
    discordID: string
  ): Promise<CrownRank[]> {
    const serverID = this.guild(ctx).id;

    return await Crown.crownRanks(serverID, discordID);
  }

  async artistCrownBan(
    ctx: BaseServiceContext,
    artistName: string
  ): Promise<ArtistCrownBan> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Crown banning artist ${artistName} in ${serverID}`);

    let existingCrownBan = await ArtistCrownBan.findOne({
      artistName,
      serverID,
    });

    if (existingCrownBan) throw new ArtistAlreadyCrownBannedError();

    let crownBan = ArtistCrownBan.create({ artistName, serverID });

    await crownBan.save();

    let bans = [
      ...(this.gowonService.shallowCache.find(
        CacheScopedKey.CrownBannedArtists,
        serverID
      ) || []),
      crownBan.artistName,
    ];

    this.gowonService.shallowCache.remember(
      CacheScopedKey.CrownBannedArtists,
      bans,
      serverID
    );

    return crownBan;
  }

  async artistCrownUnban(
    ctx: BaseServiceContext,
    artistName: string
  ): Promise<ArtistCrownBan> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Crown unbanning artist ${artistName} in ${serverID}`);

    let crownBan = await ArtistCrownBan.findOne({
      artistName,
      serverID,
    });

    if (!crownBan) throw new ArtistNotCrownBannedError();

    await crownBan.remove();

    let bans = (
      this.gowonService.shallowCache.find<string[]>(
        CacheScopedKey.CrownBannedArtists,
        serverID
      ) || []
    ).filter((a) => a !== artistName);

    this.gowonService.shallowCache.remember(
      CacheScopedKey.CrownBannedArtists,
      bans,
      serverID
    );

    return crownBan;
  }

  private async handleNewCrown(
    ctx: BaseServiceContext,
    crownOptions: {
      user: User;
      artistName: string;
      plays: number;
    },
    crown?: Crown
  ): Promise<Crown> {
    if (crown && crown.deletedAt) {
      crown.user = crownOptions.user;
      crown.plays = crownOptions.plays;
      crown.lastStolen = new Date();
      crown.deletedAt = null;

      return await crown.save();
    } else {
      let redirect = await this.redirectsService.checkRedirect(
        ctx,
        crownOptions.artistName
      );

      let artistName = redirect || crownOptions.artistName;

      let newCrown = Crown.create({
        ...crownOptions,
        serverID: this.guild(ctx).id,
        artistName,
        version: 0,
        lastStolen: new Date(),
        redirectedFrom: redirect,
      });

      await newCrown.save();

      return newCrown;
    }
  }

  private async filterByDiscordID(
    findOptions: any,
    userIDs?: string[]
  ): Promise<any> {
    if (!userIDs) return findOptions;

    let dbUserIDs = (await User.find({ discordID: In(userIDs) })).map(
      (u) => u.id
    );

    let filter = { user: In(dbUserIDs) };

    if (findOptions.where) {
      findOptions.where = Object.assign(findOptions.where, filter);
    } else {
      findOptions = Object.assign(findOptions, filter);
    }

    return findOptions;
  }

  private async handleSelfCrown(
    crown: Crown,
    plays: number
  ): Promise<CrownState> {
    if (crown.plays === plays) {
      return CrownState.updated;
    } else if (plays < this.threshold) {
      // delete the crown
      return CrownState.updated;
    } else {
      crown.plays = plays;
      await crown.save();
      return CrownState.updated;
    }
  }

  private async handleCrown(
    crown: Crown,
    plays: number,
    user: User
  ): Promise<CrownState> {
    if (crown.plays < plays) {
      crown.user = user;
      crown.plays = plays;
      crown.version++;
      crown.lastStolen = new Date();

      await crown.save();

      return CrownState.snatched;
    } else if (plays < crown.plays) return CrownState.fail;
    else if (plays < this.threshold) return CrownState.tooLow;
    else if (crown.plays === plays) return CrownState.tie;
    else return CrownState.fail;
  }

  private async handleInvalidHolder(
    crown: Crown,
    reason: InvalidCrownState,
    plays: number,
    user: User,
    artistName: string,
    artistRedirect: ArtistRedirect
  ): Promise<CrownCheck> {
    if (plays < this.threshold) {
      return {
        state: CrownState.fail,
        crown,
        artistName,
        redirect: artistRedirect,
      };
    }

    crown.user = user;
    crown.plays = plays;

    await crown.save();

    return {
      crown,
      state: reason,
      artistName,
      redirect: artistRedirect,
    };
  }
}
