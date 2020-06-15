import { Message, Client, Channel } from "discord.js";
import { LastFMService } from "./services/LastFMService";
import { UsersService } from "./services/UsersService";
import { Connection, getConnection } from "typeorm";
import { Arguments, ParsedArguments, ArgumentParser } from "./arguments";
import { UnknownError } from "./errors";
import { BotMomentService } from "./services/BotMomentService";


export interface Variation {
  variationString?: string,
  variationRegex?: RegExp,
  description?: string,
}
export interface Command {
  execute(message: Message, runAs?: string): Promise<void>;
  hasAlias(alias: string): boolean;

  variations: Variation[]
  aliases: Array<string>;
  arguments: Arguments;
  secretCommand: boolean;
  name: string;
  description: string;
  isRunnable: boolean;
}

export abstract class BaseCommand implements Command {
  name: string = this.constructor.name.toLowerCase();
  aliases: Array<string> = [];
  variations: Variation[] = [];
  description: string = "No description for this command";
  secretCommand: boolean = false;
  isRunnable: boolean = true;
  arguments: Arguments = {};

  parsedArguments: ParsedArguments = {};

  lastFMService = new LastFMService();
  usersService = new UsersService();
  botMomentService = BotMomentService.getInstance();
  db: Connection = getConnection();

  abstract async run(message: Message, runAs?: string): Promise<void>;

  async execute(message: Message, runAs?: string) {
    try {
      this.parsedArguments = this.parseArguments(message, runAs || this.name);
      await this.run(message, runAs);
    } catch (e) {
      if (e.isClientFacing) {
        await message.channel.send(e.message);
      } else {
        await message.channel.send(new UnknownError().message);
        throw e;
      }
    }
  }

  hasAlias(alias: string): boolean {
    return this.aliases.includes(alias) || this.hasVariation(alias);
  }

  hasVariation(variation: string): boolean {
    for (let v of this.variations) {
      if (v.variationString) {
        return v.variationString === variation
      } else if (v.variationRegex) {
        return v.variationRegex.test(variation)
      }
    }
    return false
  }

  parseArguments(message: Message, runAs: string): ParsedArguments {
    let parser = new ArgumentParser(this.arguments);

    return parser.parse(message, runAs);
  }
}

export class NoCommand extends BaseCommand {
  async run() {}
}
