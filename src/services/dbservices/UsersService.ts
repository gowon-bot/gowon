import { User } from "../../database/entity/User";
import { User as DiscordUser } from "discord.js";
import {
  UsernameNotRegisteredError,
  AlreadyLoggedOutError,
  RecordNotFoundError,
} from "../../errors";
import { BaseService } from "../BaseService";
import { Perspective } from "../../lib/Perspective";

export class UsersService extends BaseService {
  async getUsername(discordID: string): Promise<string> {
    this.log(
      `fetching username with discordID ${discordID}`
    );
    let user = await User.findOne({ where: { discordID} });

    if (user && user.lastFMUsername) {
      return user.lastFMUsername.toLowerCase();
    } else throw new UsernameNotRegisteredError();
  }

  async setUsername(
    discordID: string,
    lastFMUsername: string
  ): Promise<string> {
    this.log(`setting user ${discordID} with username ${lastFMUsername}`);
    let user = await User.findOne({ where: { discordID } });

    if (user) {
      user.lastFMUsername = lastFMUsername.toLowerCase();
      await user.save();
      return user.lastFMUsername;
    } else {
      user = User.create({
        discordID,
        lastFMUsername: lastFMUsername.toLowerCase(),
      });
      await user.save();
      return user.lastFMUsername!;
    }
  }

  async clearUsername(discordID: string): Promise<void> {
    this.log(`clearing username for ${discordID}`);
    let user = await User.findOne({ where: { discordID } });

    if (user?.lastFMUsername) {
      user.lastFMUsername = "";
      await user.save();
    } else throw new AlreadyLoggedOutError();
  }

  private buildPerspective(name: string, different: boolean): Perspective {
    return new Perspective(
      different,
      name,
      !different ? "your" : name + "'s",
      !different ? "you" : "they",
      !different ? "your" : "their",
      !different ? "you" : "them",
      !different ? "you are" : name + " is",
      !different ? "you are" : "they are",
      !different ? "you have" : name + " has",
      !different ? "you have" : "they have"
    );
  }

  perspective(
    authorUsername: string,
    username?: string,
    asCode = true
  ): Perspective {
    if (username === undefined || authorUsername === username) {
      return this.buildPerspective("you", false);
    } else {
      return this.buildPerspective(asCode ? username!.code() : username!, true);
    }
  }

  discordPerspective(
    author: DiscordUser,
    mentioned?: DiscordUser
  ): Perspective {
    if (mentioned === undefined || author.id === mentioned.id) {
      return this.buildPerspective("you", false).addDiscordUser(author);
    } else {
      return this.buildPerspective(mentioned?.username, true).addDiscordUser(
        mentioned
      );
    }
  }

  async getUser(discordID: string): Promise<User> {
    this.log(`fetching user with discordID ${discordID}`);
    let user = await User.findOne({ where: { discordID } });

    if (!user) throw new RecordNotFoundError("user");

    return user;
  }

  async countUsers(serverID: string): Promise<number> {
    this.log(`counting users in the server ${serverID}`);
    return await User.count({ where: { serverID } });
  }

  async getUserFromLastFMUsername(username: string): Promise<User | undefined> {
    this.log(`looking for user with username ${username}`);
    return await User.findOne({
      where: { lastFMUsername: username.toLowerCase() },
    });
  }

  async randomUser(): Promise<User>;
  async randomUser(options?: { limit?: 1 }): Promise<User>;
  async randomUser(options?: { limit?: number }): Promise<User[]>;
  async randomUser(
    options: {
      limit?: number;
    } = {}
  ): Promise<User | User[]> {
    this.log("Fetching a random user...");
    let users = await User.random({ limit: 1, ...options });

    if ((options.limit || 1) === 1) {
      return users[0] as User;
    } else {
      return users as User[];
    }
  }
}
