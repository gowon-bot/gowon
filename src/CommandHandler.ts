import { CommandManager } from "./CommandManager";
import { Command, NoCommand } from "./BaseCommand";
import { Message } from "discord.js";

export class CommandHandler {
  prefix: string;
  commandManager = CommandManager;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  async init() {
    await this.commandManager.init();
  }

  private extractCommandName(message: Message): string {
    let extractionRegex = new RegExp(`(?<=${this.prefix})[^ ]*`, "i");

    let matches = message.content.match(extractionRegex) ?? [];

    let command = matches[0];

    return command;
  }

  private extractCommand(message: Message): Command {
    let command = this.extractCommandName(message);

    if (command) {
      return this.commandManager.find(command);
    } else return new NoCommand();
  }

  async handle(message: Message): Promise<void> {
    if (message.content.startsWith(this.prefix)) {
      let command = this.extractCommand(message);
      let runAs = this.extractCommandName(message);

      await command.execute(message, runAs);
    }
  }
}
