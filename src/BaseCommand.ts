import { Message } from "discord.js";
import { LastFMService } from "./services/LastFMService";
import { UsersService } from "./services/UsersService";
import { Connection, getConnection } from "typeorm";

export interface Command {
  execute(message: Message, runAs?: string): Promise<void>;
  hasAlias(alias: string): boolean;

  variations: { [variation: string]: string };
  aliases: Array<string>;
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

  lastFMService = new LastFMService();
  usersService = new UsersService();
  db: Connection = getConnection();

  async execute(message: Message, runAs?: string) {
    await this.run(message, runAs);
  }

  abstract async run(message: Message, runAs?: string): Promise<void>;

  hasAlias(alias: string): boolean {
    return this.aliases.includes(alias) || this.hasVariation(alias);
  }

  hasVariation(variation: string): boolean {
    return Object.keys(this.variations).includes(variation);
  }

  extractArgs(message: Message): string {
    return message.content.replace(`!${this.name}`, "").trim();
  }

  extractArgsArray(message: Message): Array<string> {
    return this.extractArgs(message).split(/\s+/);
  }
}

export class NoCommand extends BaseCommand {
  async run() {}
}
