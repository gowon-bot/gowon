import { BaseCommand } from "../../lib/command/BaseCommand";
import { Message } from "discord.js";
import { CommandManager } from "../../lib/command/CommandManager";
import { Arguments } from "../../lib/arguments/arguments";
import { AdminService } from "../../services/dbservices/AdminService";
import { CommandNotFoundError } from "../../errors";
import { flatDeep } from "../../helpers";
import { ParentCommand } from "../../lib/command/ParentCommand";

const args = {
  inputs: {
    command: { index: { start: 0 } },
  },
} as const;

export default class HelpForOneCommand extends BaseCommand<typeof args> {
  idSeed = "clc seungyeon";

  shouldBeIndexed = false;

  arguments: Arguments = args;

  commandManager = new CommandManager();
  adminService = new AdminService(this.gowonClient);

  prefix!: string;

  async run(message: Message) {
    let command = this.parsedArguments.command!;

    this.prefix = await this.gowonService.prefix(this.guild.id);
    await this.commandManager.init();

    let embed = await this.helpForOneCommand(message, command);

    if (!embed) return;

    await this.send(embed);
  }

  private async helpForOneCommand(message: Message, commandName: string) {
    let { command } = await this.commandManager.find(
      commandName,
      this.guild.id
    );

    if (!command) throw new CommandNotFoundError();
    if (
      !(await this.adminService.can.run(command, message, this.gowonClient))
        .passed
    ) {
      message.channel.stopTyping();
      return;
    }

    if (command instanceof ParentCommand)
      return this.showHelpForParentCommand(message, command);

    let embed = this.newEmbed()
      .setAuthor(
        `Help with ${
          command.friendlyNameWithParent || command.friendlyName
        } for ${message.author.username}`,
        message.author.avatarURL() || ""
      )
      .setDescription(
        `${(command.friendlyNameWithParent || command.friendlyName).strong()}:
        ${command.description.italic()}

        ${
          command.usage !== undefined
            ? "**Usage**:\n" +
              flatDeep([command.usage])
                .map((u) =>
                  (this.prefix + command!.friendlyNameWithParent + " " + u)
                    .trim()
                    .code()
                )
                .join("\n") +
              "\n"
            : ""
        }
        ${
          command.aliases.length
            ? `**Aliases**: ${command.aliases.map((a) => a.code())}\n\n`
            : ""
        }${
          command.variations.length
            ? `**Variations**:
            ${command.variations
              .sort((a, b) => {
                return (
                  (b.name || b.name || "").length -
                  (a.name || a.name || "").length
                );
              })
              .map((v) => {
                const variationDisplay =
                  v.variation instanceof Array
                    ? v.variation.map((v) => v.code()).join(", ")
                    : v.variation.code();

                return `${variationDisplay} ${
                  v.description ? "- " + v.description : ""
                }`;
              })
              .join("\n")}\n\n`
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
      message,
      this.gowonClient
    );

    return this.newEmbed()
      .setAuthor(
        `Help with ${command.friendlyName} for ${message.author.username}`,
        message.author.avatarURL() || ""
      )
      .setDescription(
        `${command.friendlyName.strong()}:
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
        ${commands
          .map(
            (c) => c.friendlyName.code() + ` - ${c.description.split("\n")[0]}`
          )
          .join("\n")}
        `
      );
  }
}
