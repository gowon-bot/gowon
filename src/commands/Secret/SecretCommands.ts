import { BaseCommand } from "../../BaseCommand";
import { Message, MessageEmbed } from "discord.js";
import { CommandManager } from "../../CommandManager";

export default class SecretCommands extends BaseCommand {
  description = "Shows the secret commands";
  secretCommand = true;

  async run(message: Message) {
    let commands = CommandManager.list(true).filter(c => c.secretCommand);

    let embed = new MessageEmbed()
      .setAuthor("Secret commands for " + message.author.username)
      .setDescription(commands.map((c) => c.name).join(", "));

    await message.channel.send(embed);
  }
}
