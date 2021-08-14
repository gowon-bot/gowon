import { User } from "../../database/entity/User";
import { User as DiscordUser } from "discord.js";
import {
  UsernameNotRegisteredError,
  AlreadyLoggedOutError,
  RecordNotFoundError,
} from "../../errors";
import { BaseService } from "../BaseService";
import { Perspective } from "../../lib/Perspective";
import { ILike } from "typeorm";
import { LastFMSession } from "../LastFM/converters/Misc";
import { Requestable } from "../LastFM/LastFMAPIService";
import { buildRequestable } from "../../helpers/parseMentions";

export class UsersService extends BaseService {
  async getUsername(discordID: string): Promise<string> {
    this.log(`fetching username with discordID ${discordID}`);

    let user = await User.findOne({ where: { discordID } });

    if (user && user.lastFMUsername) {
      return user.lastFMUsername;
    } else throw new UsernameNotRegisteredError();
  }

  async getRequestable(discordID: string): Promise<Requestable> {
    this.log(`fetching requestable with discordID ${discordID}`);

    let user = await User.findOne({ where: { discordID } });

    if (user && user.lastFMUsername) {
      return buildRequestable(user.lastFMUsername, user).requestable;
    } else throw new UsernameNotRegisteredError();
  }

  async setUsername(
    discordID: string,
    lastFMUsername: string
  ): Promise<string> {
    this.log(`setting user ${discordID} with username ${lastFMUsername}`);

    let user = await User.findOne({ where: { discordID } });

    if (user) {
      user.lastFMUsername = lastFMUsername;
      user.lastFMSession = "";
    } else {
      user = User.create({
        discordID,
        lastFMUsername: lastFMUsername,
      });
    }

    await user.save();
    return user.lastFMUsername;
  }

  async setLastFMSession(
    discordID: string,
    lastFMSession: LastFMSession
  ): Promise<User> {
    this.log(
      `setting user ${discordID} with session ${lastFMSession.username}`
    );

    let user = await User.findOne({ where: { discordID } });

    if (user) {
      user.lastFMUsername = lastFMSession.username;
      user.lastFMSession = lastFMSession.key;
    } else {
      user = User.create({
        discordID,
        lastFMUsername: lastFMSession.username,
        lastFMSession: lastFMSession.key,
      });
    }

    await user.save();
    return user;
  }

  async clearUsername(discordID: string): Promise<void> {
    this.log(`clearing username and session for ${discordID}`);

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

  async getUser(discordID: string): Promise<User> {
    this.log(`fetching user with discordID ${discordID}`);

    let user = await User.findOne({ where: { discordID } });

    if (!user) throw new RecordNotFoundError("user");

    return user;
  }

  async countUsers(): Promise<number> {
    this.log("counting all users");

    return await User.count();
  }

  async getUserFromLastFMUsername(username: string): Promise<User | undefined> {
    this.log(`looking for user with username ${username}`);

    return await User.findOne({
      where: { lastFMUsername: ILike(username) },
    });
  }

  async randomUser(): Promise<User>;
  async randomUser(options?: { limit?: 1; userIDs?: string[] }): Promise<User>;
  async randomUser(options?: {
    limit?: number;
    userIDs?: string[];
  }): Promise<User[]>;
  async randomUser(
    options: {
      limit?: number;
      userIDs?: string[];
    } = {}
  ): Promise<User | User[]> {
    this.log("Fetching a random user...");

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

  async setAsIndexed(discordID: string) {
    this.log(`Setting user with id ${discordID} as indexed`);

    const user = await this.getUser(discordID);

    user.isIndexed = true;

    await user.save();
  }
}
