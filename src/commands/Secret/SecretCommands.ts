import { BaseCommand } from "../../lib/command/BaseCommand";
import { Message } from "discord.js";

export default class SecretCommands extends BaseCommand {
  idSeed = "2ne1 minzy";

  description = "Shows the secret commands";
  subcategory = "developer";
  secretCommand = true;
  devCommand = true;

  async run(message: Message) {
    let commands = this.commandRegistry
      .list(true)
      .filter((c) => c.secretCommand);

    let embed = this.newEmbed()
      .setAuthor("Secret commands for " + message.author.username)
      .setDescription(commands.map((c) => c.name).join(", "));

    await this.send(embed);
  }
}
