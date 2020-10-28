import {
  Crown,
  CrownRankResponse,
  GuildAtResponse,
  InvalidCrownState,
} from "../../database/entity/Crown";
import { User } from "../../database/entity/User";
import {
  AlreadyBannedError,
  NotBannedError,
  RecordNotFoundError,
} from "../../errors";
import { Message, User as DiscordUser } from "discord.js";
import { BaseService } from "../BaseService";
import { FindManyOptions } from "typeorm";
import { Setting } from "../../database/entity/Setting";
import { Settings } from "../../lib/Settings";
import { MoreThan } from "typeorm";
import { CrownBan } from "../../database/entity/CrownBan";
import { CacheScopedKey } from "../../database/cache/ShallowCache";
import { CrownsHistoryService } from "./CrownsHistoryService";
import { RedirectsService } from "./RedirectsService";
import { ILike } from "../../extensions/typeorm";
import { ArtistRedirect } from "../../database/entity/ArtistRedirect";

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
}

export interface CrownCheck {
  crown?: Crown;
  oldCrown?: Crown;
  state: CrownState;
  artistName: string;
  redirect: ArtistRedirect;
}

export interface CrownOptions {
  message: Message;
  discordID: string;
  artistName: string;
  plays: number;
}

export interface CrownHolder {
  user: DiscordUser;
  numberOfCrowns: number;
}

export class CrownsService extends BaseService {
  public scribe = new CrownsHistoryService(this.logger, this);

  threshold = this.gowonService.contants.crownThreshold;

  private redirectsService = new RedirectsService(this.logger);

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

  async handleNewCrown(
    crownOptions: {
      user: User;
      artistName: string;
      plays: number;
      serverID: string;
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
        crownOptions.artistName
      );

      let artistName = redirect || crownOptions.artistName;

      let newCrown = Crown.create({
        ...crownOptions,
        artistName,
        version: 0,
        lastStolen: new Date(),
        redirectedFrom: redirect,
      });

      await newCrown.save();

      return newCrown;
    }
  }

  async checkCrown(crownOptions: CrownOptions): Promise<CrownCheck> {
    let { discordID, artistName, plays, message } = crownOptions;
    this.log(`Checking crown for user ${discordID} and artist ${artistName}`);

    let redirect = (await this.redirectsService.getRedirect(artistName))!;

    let redirectedArtistName = redirect.to || redirect.from;

    let [crown, user] = await Promise.all([
      this.getCrown(redirectedArtistName, message.guild?.id!, {
        showDeleted: true,
        noRedirect: true,
      }),
      User.findOne({ where: { discordID } }),
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
        crown = await crown.refresh({ logger: this.logger });
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
        "Creating crown for " +
          redirectedArtistName +
          " in server " +
          message.guild?.id!
      );

      let newCrown = await this.handleNewCrown(
        {
          user,
          plays,
          artistName: redirectedArtistName,
          serverID: message.guild!.id,
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
    artistName: string,
    serverID: string,
    options: {
      refresh?: boolean;
      requester?: DiscordUser;
      showDeleted?: boolean;
      noRedirect?: boolean;
    } = { refresh: false, showDeleted: true, noRedirect: false }
  ): Promise<Crown | undefined> {
    this.log("Fetching crown for " + artistName);

    let crownArtistName = artistName;
    let redirectedFrom: string | undefined = undefined;

    if (!options.noRedirect) {
      let redirect = await this.redirectsService.getRedirect(artistName);

      if (redirect?.to) {
        redirectedFrom = redirect.from;
        crownArtistName = redirect.to || redirect.from;
      }
    }

    let crown = await Crown.findOne({
      where: { artistName: ILike(crownArtistName), serverID },
      withDeleted: options.showDeleted,
    });

    if (crown) crown.redirectedFrom = redirectedFrom;

    return options.refresh
      ? await crown?.refresh({
          onlyIfOwnerIs: options.requester?.id,
          logger: this.logger,
        })
      : crown;
  }

  async killCrown(artistName: string, serverID: string) {
    this.log("Killing crown for " + artistName);
    let crown = await Crown.findOne({ where: { artistName, serverID } });

    if (crown) await Crown.softRemove(crown);
  }

  async getCrownDisplay(
    artistName: string,
    message: Message
  ): Promise<{ crown: Crown; user?: DiscordUser } | undefined> {
    let crown = await this.getCrown(artistName, message.guild?.id!);

    if (!crown) return;

    let user = await crown.user.toDiscordUser(message);

    return { crown, user };
  }

  async listTopCrowns(
    discordID: string,
    serverID: string,
    limit = 10
  ): Promise<Crown[]> {
    this.log("Listing crowns for user " + discordID + " in server " + serverID);
    let user = await User.findOne({ where: { discordID } });

    if (!user) throw new RecordNotFoundError("user");

    let options: FindManyOptions = {
      where: { user, serverID },
      order: { plays: "DESC" },
    };

    if (limit > 0) options.take = limit;

    return await Crown.find(options);
  }

  async listTopCrownsInServer(serverID: string, limit = 10): Promise<Crown[]> {
    this.log("Listing crowns in server " + serverID);

    return await Crown.find({
      where: { serverID },
      order: { plays: "DESC" },
      take: limit,
    });
  }

  async count(discordID: string, serverID: string): Promise<number> {
    this.log(
      "Counting crowns for user " + discordID + " in server " + serverID
    );
    let user = await User.findOne({ where: { discordID } });

    if (!user) throw new RecordNotFoundError("user");

    return await Crown.count({ where: { user, serverID } });
  }

  async getRank(
    discordID: string,
    serverID: string
  ): Promise<CrownRankResponse> {
    this.log("Ranking user " + discordID + " in server " + serverID);
    let user = await User.findOne({ where: { discordID } });

    if (!user) throw new RecordNotFoundError("user");

    return await Crown.rank(serverID, discordID);
  }

  async countAllInServer(serverID: string): Promise<number> {
    this.log("Counting crowns for server " + serverID);

    return await Crown.count({ where: { serverID } });
  }

  async listContentiousCrownsInServer(
    serverID: string,
    limit = 10
  ): Promise<Crown[]> {
    this.log("Listing contentious crowns in server " + serverID);

    return await Crown.find({
      where: { serverID },
      order: { version: "DESC" },
      take: limit,
    });
  }

  async listRecentlyStolen(serverID: string, limit = 10): Promise<Crown[]> {
    this.log("Listing recently stolen crowns in server " + serverID);

    return await Crown.find({
      where: { serverID, version: MoreThan(1) },
      order: { lastStolen: "DESC" },
      take: limit,
    });
  }

  async topCrownHolders(
    serverID: string,
    message: Message,
    limit = 10
  ): Promise<CrownHolder[]> {
    this.log("Listing top crown holders in server " + serverID);
    let users = await Crown.guild(serverID, limit);

    return await Promise.all(
      users.map(async (rch) => ({
        user: (await User.toDiscordUser(message, rch.discordID))!,
        numberOfCrowns: rch.count.toInt(),
      }))
    );
  }

  async setInactiveRole(
    serverID: string,
    roleID?: string
  ): Promise<Setting | undefined> {
    let setting = await Setting.createUpdateOrDelete(
      Settings.InactiveRole,
      serverID,
      roleID
    );

    this.gowonService.shallowCache.remember(
      CacheScopedKey.InactiveRole,
      roleID,
      serverID
    );

    return setting;
  }

  async setPurgatoryRole(
    serverID: string,
    roleID?: string
  ): Promise<Setting | undefined> {
    let setting = await Setting.createUpdateOrDelete(
      Settings.PurgatoryRole,
      serverID,
      roleID
    );

    this.gowonService.shallowCache.remember(
      CacheScopedKey.PurgatoryRole,
      roleID,
      serverID
    );

    return setting;
  }

  private async wipeUsersCrowns(
    serverID: string,
    userID: string
  ): Promise<number> {
    let user = await User.findOne({ where: { discordID: userID } });

    let crown = await Crown.find({ serverID, user });
    let result = await Crown.softRemove(crown);

    return result.length;
  }

  async optOut(serverID: string, userID: string): Promise<number> {
    await Setting.createUpdateOrDelete(
      Settings.OptedOut,
      serverID,
      "true",
      userID
    );

    return await this.wipeUsersCrowns(serverID, userID);
  }

  async optIn(serverID: string, userID: string): Promise<void> {
    await Setting.createUpdateOrDelete(
      Settings.OptedOut,
      serverID,
      undefined,
      userID
    );
  }

  async isUserOptedOut(serverID: string, userID: string): Promise<boolean> {
    let setting = await Setting.getByName(Settings.OptedOut, serverID, userID);

    return !!setting;
  }

  async banUser(user: User, serverID: string): Promise<CrownBan> {
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

  async unbanUser(user: User, serverID: string): Promise<void> {
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

  async getCrownBannedUsers(serverID: string): Promise<CrownBan[]> {
    return await CrownBan.find({
      where: { user: { serverID } },
    });
  }

  async guildAround(
    serverID: string,
    discordID: string
  ): Promise<GuildAtResponse> {
    return await Crown.guildAround(serverID, discordID);
  }

  async guildAt(serverID: string, rank: number): Promise<GuildAtResponse> {
    return await Crown.guildAt(serverID, rank);
  }
}
