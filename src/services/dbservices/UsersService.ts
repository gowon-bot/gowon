import { User } from "../../database/entity/User";
import { User as DiscordUser } from "discord.js";
import {
  UsernameNotRegisteredError,
  AlreadyLoggedOutError,
  RecordNotFoundError,
} from "../../errors/errors";
import { BaseService } from "../BaseService";
import { Perspective } from "../../lib/Perspective";
import { ILike } from "typeorm";
import { LastFMSession } from "../LastFM/converters/Misc";
import { Requestable } from "../LastFM/LastFMAPIService";
import { buildRequestable } from "../../helpers/getMentions";
import { sqlLikeEscape } from "../../helpers/database";
import { ServiceRegistry } from "../ServicesRegistry";
import { AnalyticsCollector } from "../../analytics/AnalyticsCollector";
import { CommandAccessRoleName } from "../../lib/command/access/roles";
import { GowonContext } from "../../lib/context/Context";

export class UsersService extends BaseService {
  get analyticsCollector() {
    return ServiceRegistry.get(AnalyticsCollector);
  }

  async getUsername(ctx: GowonContext, discordID: string): Promise<string> {
    this.log(ctx, `fetching username with discordID ${discordID}`);

    const user = await User.findOne({ where: { discordID } });

    if (user && user.lastFMUsername) {
      return user.lastFMUsername;
    } else throw new UsernameNotRegisteredError();
  }

  async getUser(ctx: GowonContext, discordID: string): Promise<User> {
    this.log(ctx, `fetching user with discordID ${discordID}`);

    const user = await User.findOne({ where: { discordID } });

    if (!user) throw new RecordNotFoundError("user");

    return user;
  }

  async getRequestable(
    ctx: GowonContext,
    discordID: string
  ): Promise<Requestable> {
    this.log(ctx, `fetching requestable with discordID ${discordID}`);

    const user = await User.findOne({ where: { discordID } });

    if (user && user.lastFMUsername) {
      return buildRequestable(user.lastFMUsername, user).requestable;
    } else throw new UsernameNotRegisteredError();
  }

  async setUsername(
    ctx: GowonContext,
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
    ctx: GowonContext,
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

  async clearUsername(ctx: GowonContext, discordID: string): Promise<void> {
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

  async countUsers(ctx: GowonContext): Promise<number> {
    this.log(ctx, "counting all users");

    return await User.count();
  }

  async getUserFromLastFMUsername(
    ctx: GowonContext,
    username: string
  ): Promise<User | undefined> {
    this.log(ctx, `looking for user with username ${username}`);

    return await User.findOne({
      where: { lastFMUsername: ILike(sqlLikeEscape(username)) },
    });
  }

  async randomUser(ctx: GowonContext): Promise<User>;
  async randomUser(
    ctx: GowonContext,
    options?: { limit?: 1; userIDs?: string[] }
  ): Promise<User>;
  async randomUser(
    ctx: GowonContext,
    options?: {
      limit?: number;
      userIDs?: string[];
    }
  ): Promise<User[]>;
  async randomUser(
    ctx: GowonContext,
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

  async setAsIndexed(ctx: GowonContext, discordID: string) {
    this.log(ctx, `Setting user with id ${discordID} as indexed`);

    const user = await this.getUser(ctx, discordID);

    user.isIndexed = true;

    await user.save();
  }

  async setPatron(ctx: GowonContext, discordID: string, value: boolean) {
    this.log(ctx, `Setting user with id ${discordID} as a patron`);

    const user = await this.getUser(ctx, discordID);

    user.isPatron = value;

    await user.save();
  }

  async setRoles(
    ctx: GowonContext,
    discordID: string,
    roles: CommandAccessRoleName[]
  ): Promise<User> {
    const user = await this.getUser(ctx, discordID);

    user.roles = roles;

    await user.save();

    return user;
  }

  async setSpotifyRefreshToken(
    ctx: GowonContext,
    discordID: string,
    refreshToken: string
  ) {
    const user = await this.getUser(ctx, discordID);

    user.spotifyRefreshToken = refreshToken;

    await user.save();
  }

  async getSpotifyRefreshToken(
    ctx: GowonContext,
    discordID: string
  ): Promise<string | undefined> {
    const user = await this.getUser(ctx, discordID);

    return user.spotifyRefreshToken;
  }
}
