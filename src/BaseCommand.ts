import { Message } from "discord.js";
import { LastFMService } from "./services/LastFMService";
import { UsersService } from "./services/UsersService";
import { Connection, getConnection } from "typeorm";
import { Arguments, ParsedArguments, ArgumentParser } from "./arguments";

export interface Command {
  execute(message: Message, runAs?: string): Promise<void>;
  hasAlias(alias: string): boolean;

  variations: { [variation: string]: string };
  aliases: Array<string>;
  arguments: Arguments;
  secretCommand: boolean;
  name: string;
  description: string;
}

export abstract class BaseCommand implements Command {
  aliases: Array<string> = [];
  variations: { [variation: string]: string } = {};
  name: string = this.constructor.name.toLowerCase();
  description: string = "No description for this command";
  secretCommand: boolean = false;
  arguments: Arguments = {};

  parsedArguments: ParsedArguments = {};

  lastFMService = new LastFMService();
  usersService = new UsersService();
  db: Connection = getConnection();

  abstract async run(message: Message, runAs?: string): Promise<void>;

  async execute(message: Message, runAs?: string) {
    this.parsedArguments = this.parseArguments(message, runAs || this.name);
    await this.run(message, runAs);
  }

  hasAlias(alias: string): boolean {
    return this.aliases.includes(alias) || this.hasVariation(alias);
  }

  hasVariation(variation: string): boolean {
    return Object.keys(this.variations).includes(variation);
  }

  _extractArgs(message: Message, runAs?: string): string {
    return message.content.replace(`!${runAs ? runAs : this.name}`, "").trim();
  }

  _extractArgsArray(message: Message): Array<string> {
    return this._extractArgs(message).split(/\s+/);
  }

  parseArguments(message: Message, runAs: string): ParsedArguments {
    let parser = new ArgumentParser();

    return parser.parse(message, this.arguments, runAs);
  }
}

export class NoCommand extends BaseCommand {
  async run() {}
}
