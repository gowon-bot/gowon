import { User } from "../../database/entity/User";
import { User as DiscordUser } from "discord.js";
import {
  UsernameNotRegisteredError,
  AlreadyLoggedOutError,
  RecordNotFoundError,
} from "../../errors";
import { BaseService, BaseServiceContext } from "../BaseService";
import { Perspective } from "../../lib/Perspective";
import { ILike } from "typeorm";
import { LastFMSession } from "../LastFM/converters/Misc";
import { Requestable } from "../LastFM/LastFMAPIService";
import { buildRequestable } from "../../helpers/getMentions";
import { sqlLikeEscape } from "../../helpers/database";
import { ServiceRegistry } from "../ServicesRegistry";
import { AnalyticsCollector } from "../../analytics/AnalyticsCollector";
import { CommandAccessRoleName } from "../../lib/command/access/roles";
import { SpotifyCode } from "../Spotify/SpotifyService.types";

export class UsersService extends BaseService {
  get analyticsCollector() {
    return ServiceRegistry.get(AnalyticsCollector);
  }

  async getUsername(
    ctx: BaseServiceContext,
    discordID: string
  ): Promise<string> {
    this.log(ctx, `fetching username with discordID ${discordID}`);

    const user = await User.findOne({ where: { discordID } });

    if (user && user.lastFMUsername) {
      return user.lastFMUsername;
    } else throw new UsernameNotRegisteredError();
  }

  async getUser(ctx: BaseServiceContext, discordID: string): Promise<User> {
    this.log(ctx, `fetching user with discordID ${discordID}`);

    const user = await User.findOne({ where: { discordID } });

    if (!user) throw new RecordNotFoundError("user");

    return user;
  }

  async getRequestable(
    ctx: BaseServiceContext,
    discordID: string
  ): Promise<Requestable> {
    this.log(ctx, `fetching requestable with discordID ${discordID}`);

    const user = await User.findOne({ where: { discordID } });

    if (user && user.lastFMUsername) {
      return buildRequestable(user.lastFMUsername, user).requestable;
    } else throw new UsernameNotRegisteredError();
  }

  async setUsername(
    ctx: BaseServiceContext,
    discordID: string,
    lastFMUsername: string
  ): Promise<string> {
    this.log(ctx, `setting user ${discordID} with username ${lastFMUsername}`);

    let user = await User.findOne({ where: { discordID } });

    if (user) {
      user.lastFMUsername = lastFMUsername;
      user.lastFMSession = "";
    } else {
      this.analyticsCollector.metrics.userCount.inc();
      user = User.create({
        discordID,
        lastFMUsername: lastFMUsername,
      });
    }

    await user.save();
    return user.lastFMUsername;
  }

  async setLastFMSession(
    ctx: BaseServiceContext,
    discordID: string,
    lastFMSession: LastFMSession
  ): Promise<User> {
    this.log(
      ctx,
      `setting user ${discordID} with session ${lastFMSession.username}`
    );

    let user = await User.findOne({ where: { discordID } });

    if (user) {
      user.lastFMUsername = lastFMSession.username;
      user.lastFMSession = lastFMSession.key;
    } else {
      this.analyticsCollector.metrics.userCount.inc();
      user = User.create({
        discordID,
        lastFMUsername: lastFMSession.username,
        lastFMSession: lastFMSession.key,
      });
    }

    await user.save();
    return user;
  }

  async clearUsername(
    ctx: BaseServiceContext,
    discordID: string
  ): Promise<void> {
    this.log(ctx, `clearing username and session for ${discordID}`);

    let user = await User.findOne({ where: { discordID } });

    if (user?.lastFMUsername || user?.lastFMSession) {
      user.lastFMUsername = "";
      user.lastFMSession = "";
      await user.save();
    } else throw new AlreadyLoggedOutError();
  }

  perspective(
    authorUsername: string,
    username?: string,
    asCode = true
  ): Perspective {
    return Perspective.perspective(authorUsername, username, asCode);
  }

  discordPerspective(
    author: DiscordUser,
    mentioned?: DiscordUser
  ): Perspective {
    return Perspective.discordPerspective(author, mentioned);
  }

  async countUsers(ctx: BaseServiceContext): Promise<number> {
    this.log(ctx, "counting all users");

    return await User.count();
  }

  async getUserFromLastFMUsername(
    ctx: BaseServiceContext,
    username: string
  ): Promise<User | undefined> {
    this.log(ctx, `looking for user with username ${username}`);

    return await User.findOne({
      where: { lastFMUsername: ILike(sqlLikeEscape(username)) },
    });
  }

  async randomUser(ctx: BaseServiceContext): Promise<User>;
  async randomUser(
    ctx: BaseServiceContext,
    options?: { limit?: 1; userIDs?: string[] }
  ): Promise<User>;
  async randomUser(
    ctx: BaseServiceContext,
    options?: {
      limit?: number;
      userIDs?: string[];
    }
  ): Promise<User[]>;
  async randomUser(
    ctx: BaseServiceContext,
    options: {
      limit?: number;
      userIDs?: string[];
    } = {}
  ): Promise<User | User[]> {
    this.log(ctx, "Fetching a random user...");

    let users = await User.random({
      limit: options.limit || 1,
      userIDs: options.userIDs,
    });

    if ((options.limit || 1) === 1) {
      return users[0] as User;
    } else {
      return users as User[];
    }
  }

  async setAsIndexed(ctx: BaseServiceContext, discordID: string) {
    this.log(ctx, `Setting user with id ${discordID} as indexed`);

    const user = await this.getUser(ctx, discordID);

    user.isIndexed = true;

    await user.save();
  }

  async setPatron(ctx: BaseServiceContext, discordID: string, value: boolean) {
    this.log(ctx, `Setting user with id ${discordID} as a patron`);

    const user = await this.getUser(ctx, discordID);

    user.isPatron = value;

    await user.save();
  }

  async setRoles(
    ctx: BaseServiceContext,
    discordID: string,
    roles: CommandAccessRoleName[]
  ): Promise<User> {
    const user = await this.getUser(ctx, discordID);

    user.roles = roles;

    await user.save();

    return user;
  }

  async getSpotifyCode(
    ctx: BaseServiceContext,
    discordID: string
  ): Promise<SpotifyCode | undefined> {
    const user = await this.getUser(ctx, discordID);

    return user.spotifyCode ? { code: user.spotifyCode, state: "" } : undefined;
  }

  async setSpotifyCode(
    ctx: BaseServiceContext,
    discordID: string,
    code: SpotifyCode
  ) {
    const user = await this.getUser(ctx, discordID);

    user.spotifyCode = code.code;

    await user.save();
  }
}
