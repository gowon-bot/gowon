import commands from "./commands";
import { Command, NoCommand } from "./commands/Command";
import { Message } from "discord.js";

export class CommandHandler {
  prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private extractCommand(message: Message): Command {    
    let extractionRegex = new RegExp(
      `(?<=${this.prefix})[^ ]*`,
      "i"
    );

    let matches = message.content.match(extractionRegex) ?? [];

    let command = matches[0];

    if (command) {
      return commands.find(command);
    } else return new NoCommand();
  }

  async handle(message: Message): Promise<void> {
    if (message.content.startsWith(this.prefix)) {
      let command = this.extractCommand(message);

      await command.execute(message);
    }
  }
}
