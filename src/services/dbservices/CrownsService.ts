import {
  Crown,
  CrownRankResponse,
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
import { ShallowCacheScopedKey } from "../../database/cache/ShallowCache";

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
}

export interface CrownOptions {
  message: Message;
  discordID: string;
  artistName: string;
  plays: number;
}

interface RawCrownHolder {
  userId: number;
  discordID: string;
  count: string;
}

export interface CrownHolder {
  user: DiscordUser;
  numberOfCrowns: number;
}

export class CrownsService extends BaseService {
  threshold = this.gowonService.contants.crownThreshold;

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
    user: User
  ): Promise<CrownCheck> {
    crown.user = user;
    crown.plays = plays;

    await crown.save();

    return {
      crown,
      state: reason,
    };
  }

  async checkCrown(crownOptions: CrownOptions): Promise<CrownCheck> {
    let { discordID, artistName, plays, message } = crownOptions;
    this.log(`Checking crown for user ${discordID} and artist ${artistName}`);

    let [crown, user] = await Promise.all([
      this.getCrown(artistName, message.guild?.id!),
      User.findOne({ where: { discordID } }),
    ]);

    let oldCrown = Object.assign({}, crown);
    oldCrown.user = Object.assign({}, crown?.user);

    if (!user) throw new RecordNotFoundError("user");

    let crownState: CrownState;

    if (crown) {
      let invalidCheck = await crown.invalid(message);

      if (invalidCheck.failed) {
        return {
          ...(await this.handleInvalidHolder(
            crown,
            invalidCheck.reason!,
            plays,
            user
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

      return { crown: crown, state: crownState, oldCrown };
    } else {
      if (plays < this.threshold) return { state: CrownState.tooLow };
      this.log(
        "Creating crown for " + artistName + " in server " + message.guild?.id!
      );

      let crown = Crown.create({
        user,
        artistName,
        plays,
        serverID: message.guild?.id!,
        version: 1,
        lastStolen: new Date(),
      });

      await crown.save();

      return {
        crown: crown,
        state: CrownState.newCrown,
        oldCrown,
      };
    }
  }

  async getCrown(
    artistName: string,
    serverID: string,
    options: { refresh: boolean; requester?: DiscordUser } = { refresh: false }
  ): Promise<Crown | undefined> {
    this.log("Fetching crown for " + artistName);
    let crown = await Crown.findOne({ where: { artistName, serverID } });

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

    await crown?.remove();
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
    let users = (await Crown.query(
      `select
        count(*) as count,
        "userId",
        "discordID"
      from crowns c
      left join users u
        on u.id = "userId"
      where c."serverID" like $1
      group by "userId", "discordID"
      order by count desc
      limit $2`,
      [serverID, limit]
    )) as RawCrownHolder[];

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
      ShallowCacheScopedKey.InactiveRole,
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
      ShallowCacheScopedKey.PurgatoryRole,
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

    let result = await Crown.delete({ serverID, user });

    return result.affected!;
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

    let crownBan = CrownBan.create({ user });
    await crownBan.save();

    let bans = [
      ...(this.gowonService.shallowCache.find(
        ShallowCacheScopedKey.CrownBannedUsers,
        serverID
      ) || []),
      user.discordID,
    ];

    this.gowonService.shallowCache.remember(
      ShallowCacheScopedKey.CrownBannedUsers,
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
        ShallowCacheScopedKey.CrownBannedUsers,
        serverID
      ) || []
    ).filter((u) => u !== user.discordID);

    this.gowonService.shallowCache.remember(
      ShallowCacheScopedKey.CrownBannedUsers,
      bans,
      serverID
    );
  }

  async getCrownBannedUsers(serverID: string): Promise<CrownBan[]> {
    return await CrownBan.find({
      where: { user: { serverID } },
    });
  }
}
