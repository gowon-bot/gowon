import { User as DiscordUser } from "discord.js";
import { FindManyOptions, ILike, In, MoreThan } from "typeorm";
import { ArtistCrownBan } from "../../database/entity/ArtistCrownBan";
import { ArtistRedirect } from "../../database/entity/ArtistRedirect";
import {
  Crown,
  CrownRank,
  CrownRankResponse,
  GuildAtResponse,
  InvalidCrownState,
} from "../../database/entity/Crown";
import { CrownBan } from "../../database/entity/CrownBan";
import { Setting } from "../../database/entity/Setting";
import { User } from "../../database/entity/User";
import {
  AlreadyCrownBannedError,
  ArtistAlreadyCrownBannedError,
  ArtistNotCrownBannedError,
  NotCrownBannedError,
} from "../../errors/crowns";
import {
  ArtistCrownBannedError,
  RecordNotFoundError,
} from "../../errors/errors";
import { asyncMap } from "../../helpers";
import { sqlLikeEscape } from "../../helpers/database";
import { toInt } from "../../helpers/lastfm/";
import { constants } from "../../lib/constants";
import { GowonContext } from "../../lib/context/Context";
import { SettingsService } from "../../lib/settings/SettingsService";
import { BaseService } from "../BaseService";
import { GowonService } from "../GowonService";
import { ServiceRegistry } from "../ServicesRegistry";
import { CrownsHistoryService } from "./CrownsHistoryService";
import { RedirectsService } from "./RedirectsService";

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
  private get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }

  get threshold() {
    return constants.crownThreshold;
  }

  async checkCrown(
    ctx: GowonContext,
    crownOptions: CrownOptions
  ): Promise<CrownCheck> {
    const { artistName, plays } = crownOptions;
    const author = ctx.author;
    const guild = ctx.requiredGuild;

    this.log(
      ctx,
      `Checking crown for user ${author.id} and artist ${artistName}`
    );

    const redirect = (await this.redirectsService.getRedirect(
      ctx,
      artistName
    ))!;

    const redirectedArtistName = redirect.to || redirect.from;

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
      User.findOneBy({ discordID: author.id }),
    ]);

    if (redirect.to && crown) {
      crown.redirectedFrom = redirect.from;
    }

    const oldCrown = Object.assign({}, crown);
    oldCrown.user = Object.assign({}, crown?.user);

    if (!user) throw new RecordNotFoundError("user");

    let crownState: CrownState;

    if (crown && !crown.deletedAt) {
      const invalidCheck = await crown.invalid(ctx);

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

      const newCrown = await this.handleNewCrown(
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
    ctx: GowonContext,
    artistName: string,
    options: {
      refresh?: boolean;
      requester?: DiscordUser;
      showDeleted?: boolean;
      noRedirect?: boolean;
      caseSensitive?: boolean;
    } = { refresh: false, showDeleted: true, noRedirect: false }
  ): Promise<Crown | undefined> {
    const serverID = ctx.requiredGuild.id;

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
          : ILike(sqlLikeEscape(crownArtistName)),
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
      : crown ?? undefined;
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

  private async handleNewCrown(
    ctx: GowonContext,
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
        serverID: ctx.requiredGuild.id,
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
