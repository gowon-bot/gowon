import { BaseCommand, Command } from "../BaseCommand";
import { Message, MessageEmbed } from "discord.js";
import { CommandManager } from "../CommandManager";
import { Arguments, groupArgumentsBySplit } from "../arguments";

export default class Help extends BaseCommand {
  aliases = ["h"];
  description = "Displays the help menu";

  arguments: Arguments = {
    inputs: {
      command: { index: 0 },
    },
  };

  private parseAliases(embed: MessageEmbed, command: Command): MessageEmbed {
    return command.aliases.length
      ? embed.addField(
          "Aliases",
          command.aliases.map((a) => `\`${a}\``).join(", "),
          true
        )
      : embed;
  }

  private parseName(embed: MessageEmbed, command: Command): MessageEmbed {
    return embed
      .setTitle(command.name)
      .addField("Description", command.description);
  }

  private parseVariations(embed: MessageEmbed, command: Command): MessageEmbed {
    return Object.keys(command.variations).length
      ? embed.addField(
          "Variations",
          command.variations
            .map((variation) => `\`${variation.variationString || variation.variationRegex}\`: ${variation.description}`)
            .join("\n")
        )
      : embed;
  }

  private parseCommandArguments(
    embed: MessageEmbed,
    command: Command
  ): MessageEmbed {
    if (command.arguments.mentions)
      embed.addField(
        "Mentions",
        Object.values(command.arguments.mentions)
          .map((m) => `\`@${m.name}\`: ${m.description ?? ""}`)
          .join("\n")
      );

    if (command.arguments.inputs) {
      let groupedArguments = groupArgumentsBySplit(command.arguments);

      let argumentCombinations: Array<string> = [];

      for (let split of Object.keys(groupedArguments)) {
        let args = groupedArguments[split];

        let argNames = args
          .sort(
            (a, b) =>
              (typeof b.index === "number" ? b.index : b.index.start) -
              (typeof a.index === "number" ? a.index : a.index.start)
          )
          .map((a) => (a.optional ? a.name + "?" : a.name))
          .join(split !== " " ? " " + split + " " : split);

        argumentCombinations.push(command.name + " " + argNames);
      }
      embed.addField("Usage", argumentCombinations.join("\n"));
    }

    return embed;
  }

  async run(message: Message) {
    let commandName = this.parsedArguments.command as string;

    let embed = new MessageEmbed().setAuthor(
      "Help for " + message.author.username
    );

    if (commandName) {
      let command = CommandManager.find(commandName);

      embed = this.parseAliases(embed, command);
      embed = this.parseName(embed, command);
      embed = this.parseVariations(embed, command);
      embed = this.parseCommandArguments(embed, command);
    } else {
      let commands = CommandManager.list();

      embed = embed.setDescription(commands.map((c) => c.name).join(", "));
    }

    await message.channel.send(embed);
  }
}
