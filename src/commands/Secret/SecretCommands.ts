import { BaseCommand } from "../../lib/command/BaseCommand";
import { Message } from "discord.js";
import { CommandManager } from "../../lib/command/CommandManager";

export default class SecretCommands extends BaseCommand {
  description = "Shows the secret commands";
  secretCommand = true;

  commandManager = new CommandManager();

  async run(message: Message) {
    await this.commandManager.init();

    let commands = this.commandManager
      .list(true)
      .filter((c) => c.secretCommand);

    let embed = this.newEmbed()
      .setAuthor("Secret commands for " + message.author.username)
      .setDescription(commands.map((c) => c.name).join(", "));

    await this.send(embed);
  }
}
