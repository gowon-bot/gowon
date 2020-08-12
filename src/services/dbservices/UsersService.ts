import { User } from "../../database/entity/User";
import { User as DiscordUser } from "discord.js";
import {
  UsernameNotRegisteredError,
  AlreadyLoggedOutError,
  RecordNotFoundError,
} from "../../errors";
import { BaseService } from "../BaseService";

export class Perspective {
  name: string;
  possessive: string;
  pronoun: string;
  possesivePronoun: string;
  objectPronoun: string;
  plusToBe: string;
  pronounPlusToBe: string;
  plusToHave: string;
  pronounPlusToHave: string;

  discordUser?: DiscordUser;

  constructor(options: {
    name: string;
    possessive: string;
    pronoun: string;
    possesivePronoun: string;
    objectPronoun: string;
    plusToBe: string;
    pronounPlusToBe: string;
    plusToHave: string;
    pronounPlusToHave: string;
  }) {
    this.name = options.name;
    this.possessive = options.possessive;
    this.pronoun = options.pronoun;
    this.possesivePronoun = options.possesivePronoun;
    this.objectPronoun = options.objectPronoun;
    this.plusToBe = options.plusToBe;
    this.pronounPlusToBe = options.pronounPlusToBe;
    this.plusToHave = options.plusToHave;
    this.pronounPlusToHave = options.pronounPlusToHave;
  }

  addDiscordUser(user: DiscordUser): Perspective {
    this.discordUser = user;
    return this;
  }

  regularVerb(verb: string) {
    return this.name + " " + (this.name === "you" ? verb : verb + "s");
  }
}

export class DiscordPersective extends Perspective {
  user!: DiscordUser;
}

export class UsersService extends BaseService {
  async getUsername(discordID: string, serverID: string): Promise<string> {
    this.log(
      `fetching username with discordID ${discordID} in the server ${serverID}`
    );
    let user = await User.findOne({ where: { discordID, serverID } });

    if (user && user.lastFMUsername) {
      return user.lastFMUsername.toLowerCase();
    } else throw new UsernameNotRegisteredError();
  }

  async setUsername(
    discordID: string,
    serverID: string,
    lastFMUsername: string
  ): Promise<string> {
    this.log(
      `setting user ${discordID} in ${serverID} with username ${lastFMUsername}`
    );
    let user = await User.findOne({ where: { discordID, serverID } });

    if (user) {
      user.lastFMUsername = lastFMUsername.toLowerCase();
      await user.save();
      return user.lastFMUsername;
    } else {
      user = User.create({
        discordID,
        lastFMUsername: lastFMUsername.toLowerCase(),
        serverID,
      });
      await user.save();
      return user.lastFMUsername!;
    }
  }

  async clearUsername(discordID: string, serverID: string): Promise<void> {
    this.log(`clearing username for ${discordID} in ${serverID}`);
    let user = await User.findOne({ where: { discordID, serverID } });

    if (user?.lastFMUsername) {
      user.lastFMUsername = "";
      await user.save();
    } else throw new AlreadyLoggedOutError();
  }

  private buildPerspective(name: string): Perspective {
    return new Perspective({
      name: name,
      possessive: name === "you" ? "your" : name + "'s",
      pronoun: name === "you" ? "you" : "they",
      possesivePronoun: name === "you" ? "your" : "their",
      objectPronoun: name === "you" ? "you" : "them",
      plusToBe: name === "you" ? "you are" : name + " is",
      pronounPlusToBe: name === "you" ? "you are" : "they are",
      plusToHave: name === "you" ? "you have" : name + " has",
      pronounPlusToHave: name === "you" ? "you have" : "they have",
    });
  }

  perspective(
    authorUsername: string,
    username?: string,
    asCode = true
  ): Perspective {
    if (username === undefined || authorUsername === username) {
      return this.buildPerspective("you");
    } else {
      return this.buildPerspective(asCode ? username!.code() : username!);
    }
  }

  discordPerspective(
    author: DiscordUser,
    mentioned?: DiscordUser
  ): Perspective {
    if (mentioned === undefined || author.id === mentioned.id) {
      return this.buildPerspective("you").addDiscordUser(author);
    } else {
      return this.buildPerspective(mentioned?.username).addDiscordUser(
        mentioned
      );
    }
  }

  async getUser(discordID: string, serverID: string): Promise<User> {
    this.log(
      `fetching user with discordID ${discordID} in the server ${serverID}`
    );
    let user = await User.findOne({ where: { discordID, serverID } });

    if (!user) throw new RecordNotFoundError("user");

    return user;
  }

  async countUsers(serverID: string): Promise<number> {
    this.log(`counting users in the server ${serverID}`);
    return await User.count({ where: { serverID } });
  }

  async getUserFromLastFMUsername(
    username: string,
    serverID: string
  ): Promise<User | undefined> {
    this.log(`looking for user with username ${username} in ${serverID}`);
    return await User.findOne({
      where: { lastFMUsername: username.toLowerCase(), serverID },
    });
  }

  async randomUser(): Promise<User> {
    this.log("Fetching a random user...");
    return await User.random();
  }
}
