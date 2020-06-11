import { Message } from "discord.js";
import { LastFMService } from "../services/LastFMService";
import { UsersService } from "../services/UsersService";
import { Connection, getConnection } from "typeorm";

export interface Command {
  execute(message: Message): Promise<void>;
  hasAlias(alias: string): boolean;
}

export abstract class BaseCommand implements Command {
  aliases: Array<string> = [];
  name: string = this.constructor.name.toLowerCase();

  lastFMService = new LastFMService();
  usersService = new UsersService();
  db: Connection = getConnection();

  async execute(message: Message) {
    await this.run(message);
  }

  abstract async run(message: Message): Promise<void>;

  hasAlias(alias: string): boolean {
    return this.aliases.includes(alias);
  }

  extractArgs(message: Message, split: boolean = false): string {
    return message.content.replace(`!${this.name}`, "").trim();
  }
}

export class NoCommand extends BaseCommand {
  async run() {}
}
