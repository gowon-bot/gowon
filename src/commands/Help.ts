import { BaseCommand } from "../BaseCommand";
import { Message, MessageEmbed } from "discord.js";
import commandManager from "../commands";

export class Help extends BaseCommand {
  aliases = ["h"];
  description = "Displays the help menu";

  async run(message: Message) {
    let [commandName] = this.extractArgsArray(message);

    let embed = new MessageEmbed().setAuthor(
      "Help for " + message.author.username
    );

    if (commandName) {
      let command = commandManager.find(commandName);

      embed = embed
        .setTitle(command.name)
        .addField("Description", command.description, true);

      embed = command.aliases.length
        ? embed.addField("Aliases", command.aliases.join(", "), true)
        : embed;

      embed = Object.keys(command.variations).length
        ? embed.addField(
            "Variations",
            Object.keys(command.variations)
              .map(
                (variation) => `${variation} - ${command.variations[variation]}`
              )
              .join("\n")
          )
        : embed;
    } else {
      let commands = commandManager.list(false);

      embed = embed.setDescription(commands.map((c) => c.name).join(", "));
    }

    await message.channel.send(embed);
  }
}
