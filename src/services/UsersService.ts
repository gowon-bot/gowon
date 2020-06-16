import { User } from "../database/entity/User";
import { User as DiscordUser } from "discord.js";
import { UsernameNotRegisteredError } from "../errors";

export class Perspective {
  name: string;
  possessive: string;
  pronoun: string;
  possesivePronoun: string;
  plusToBe: string;
  pronounPlusToBe: string;
  plusToHave: string;
  pronounPlusToHave: string;

  constructor(options: {
    name: string;
    possessive: string;
    pronoun: string;
    possesivePronoun: string;
    plusToBe: string;
    pronounPlusToBe: string;
    plusToHave: string;
    pronounPlusToHave: string;
  }) {
    this.name = options.name;
    this.possessive = options.possessive;
    this.pronoun = options.pronoun;
    this.possesivePronoun = options.possesivePronoun;
    this.plusToBe = options.plusToBe;
    this.pronounPlusToBe = options.pronounPlusToBe;
    this.plusToHave = options.plusToHave;
    this.pronounPlusToHave = options.pronounPlusToHave;
  }

  regularVerb(verb: string) {
    return this.name + " " + (this.name === "you" ? verb : verb + "s");
  }
}

export class UsersService {
  async getUsername(discordID: string): Promise<string> {
    let user = await User.findOne({ discordID: discordID });

    if (user) {
      return user.lastFMUsername;
    } else throw new UsernameNotRegisteredError();
  }

  async setUsername(
    discordID: string,
    lastFMUsername: string
  ): Promise<string> {
    let user = await User.findOne({ discordID: discordID });

    if (user) {
      user.lastFMUsername = lastFMUsername;
      await user.save();
      return user.lastFMUsername;
    } else {
      user = User.create({
        discordID: discordID,
        lastFMUsername: lastFMUsername,
      });
      await user.save();
      return user.lastFMUsername;
    }
  }

  private buildPerspective(name: string): Perspective {
    return new Perspective({
      name: name,
      possessive: name === "you" ? "your" : name + "'s",
      pronoun: name === "you" ? "you" : "they",
      possesivePronoun: name === "you" ? "your" : "their",
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
      return this.buildPerspective(asCode ? "`" + username! + "`" : username!);
    }
  }

  discordPerspective(
    author: DiscordUser,
    mentioned?: DiscordUser
  ): Perspective {
    if (mentioned === undefined || author.id === mentioned.id) {
      return this.buildPerspective("you");
    } else {
      return this.buildPerspective(mentioned?.username);
    }
  }
}
