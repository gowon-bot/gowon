import { BaseCommand, Command, NoCommand } from "../lib/command/BaseCommand";
import { Message, MessageEmbed } from "discord.js";
import { CommandManager } from "../lib/command/CommandManager";
import { Arguments } from "../lib/arguments/arguments";
import { AdminService } from "../services/dbservices/AdminService";
import { CommandNotFoundError } from "../errors";
import { flatDeep } from "../helpers";
import { ParentCommand } from "../lib/command/ParentCommand";

export default class Help extends BaseCommand {
  aliases = ["h"];
  description = "Displays the help menu";
  usage = ["", "command"];

  arguments: Arguments = {
    inputs: {
      command: { index: { start: 0 } },
    },
  };

  commandManager = new CommandManager();
  adminService = new AdminService();

  prefix!: string;

  async run(message: Message) {
    this.prefix = this.gowonService.prefix(this.guild.id);

    await this.commandManager.init();

    let command = this.parsedArguments.command as string;

    let embed = await (command
      ? this.helpForOneCommand(message, command)
      : this.helpForAllCommands(message));

    if (!embed) return;

    await this.send(embed);
  }

  private async helpForAllCommands(message: Message) {
    let commands = await this.adminService.can.viewList(
      this.commandManager.list(),
      message
    );

    interface GroupedCommands {
      [category: string]: {
        [subcategory: string]: Command[];
      };
    }

    let groupedCommands = commands.reduce((acc, c) => {
      if (!acc[c.category || "misc"]) acc[c.category || "misc"] = {};
      if (!acc[c.category || "misc"][c.subcategory || ""])
        acc[c.category || "misc"][c.subcategory || ""] = [];

      acc[c.category || "misc"][c.subcategory || ""].push(c);

      return acc;
    }, {} as GroupedCommands);

    return new MessageEmbed()
      .setAuthor(
        `Help for ${message.author.username}`,
        message.author.avatarURL() || ""
      )
      .setDescription(
        `Run \`${this.prefix}help <command>\` to learn more about specific commands`
      )
      .addFields(
        Object.keys(groupedCommands).map((gc) => ({
          name: gc,
          value:
            (groupedCommands[gc][""]
              ? Object.values(groupedCommands[gc][""])
                  .map((c) => c.friendlyName)
                  .join(", ")
                  .italic() + "\n"
              : "") +
            Object.keys(groupedCommands[gc])
              .filter((k) => k !== "")
              .map(
                (k) =>
                  k.bold() +
                  ": " +
                  groupedCommands[gc][k].map((c) => c.friendlyName).join(", ")
              )
              .join("\n"),
        }))
      );
  }

  private async helpForOneCommand(message: Message, commandName: string) {
    let command = this.commandManager.find(commandName, this.guild.id).command;

    if (command instanceof NoCommand) throw new CommandNotFoundError();
    if (!(await this.adminService.can.run(command, message)).passed) {
      message.channel.stopTyping();
      return;
    }

    if (command instanceof ParentCommand)
      return this.showHelpForParentCommand(message, command);

    let embed = new MessageEmbed()
      .setAuthor(
        `Help with ${
          command.friendlyNameWithParent || command.friendlyName
        } for ${message.author.username}`,
        message.author.avatarURL() || ""
      )
      .setDescription(
        `
        ${(command.friendlyNameWithParent || command.friendlyName).bold()}:
        ${command.description.italic()}

        ${
          command.aliases.length
            ? `**Aliases**: ${command.aliases.map((a) => a.code())}\n\n`
            : ""
        }${
          command.variations.length
            ? `**Variations**:
            ${command.variations
              .map(
                (a) =>
                  `${a.variationString || a.friendlyString} ${
                    a.description ? "- " + a.description : ""
                  }`
              )
              .join("\n")}\n\n`
            : ""
        }${
          command.usage !== undefined
            ? "**Usage**:\n" +
              flatDeep([command.usage])
                .map((u) =>
                  (this.prefix + command.friendlyNameWithParent + " " + u)
                    .trim()
                    .code()
                )
                .join("\n")
            : ""
        }`
      );

    return embed;
  }

  private async showHelpForParentCommand(
    message: Message,
    command: ParentCommand
  ) {
    let commands = await this.adminService.can.viewList(
      command.children.list(),
      message
    );

    return new MessageEmbed()
      .setAuthor(
        `Help with ${command.friendlyName} for ${message.author.username}`,
        message.author.avatarURL() || ""
      )
      .setDescription(
        `${command.friendlyName.bold()}:
        ${command.description.italic()}
        
        ${
          command.prefixes
            ? `**Prefixes**:
            ${flatDeep([command.prefixes])
              .map((p) => p.trim().code())
              .join(", ")}\n`
            : ""
        }
        **Commands**:
        ${commands.map((c) => c.friendlyName).join(", ")}
        `
      );
  }
}
