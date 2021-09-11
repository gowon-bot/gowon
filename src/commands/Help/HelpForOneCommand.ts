import { BaseCommand } from "../../lib/command/BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../lib/arguments/arguments";
import { AdminService } from "../../services/dbservices/AdminService";
import { CommandNotFoundError } from "../../errors";
import { flatDeep } from "../../helpers";
import { ParentCommand } from "../../lib/command/ParentCommand";
import { LineConsolidator } from "../../lib/LineConsolidator";
import { Command } from "../../lib/command/Command";

const args = {
  inputs: {
    command: { index: { start: 0 } },
  },
} as const;

export default class HelpForOneCommand extends BaseCommand<typeof args> {
  idSeed = "clc seungyeon";

  shouldBeIndexed = false;

  arguments: Arguments = args;

  adminService = new AdminService(this.gowonClient);

  async run(message: Message) {
    let command = this.parsedArguments.command!;

    let embed = await this.helpForOneCommand(message, command);

    if (!embed) return;

    await this.send(embed);
  }

  private async helpForOneCommand(message: Message, input: string) {
    let { command } = await this.commandRegistry.find(input, this.guild.id);

    if (!command) throw new CommandNotFoundError();

    if (command.customHelp) {
      this.runCustomHelp(command);
      return;
    }

    if (
      !(await this.adminService.can.run(command, message, this.gowonClient))
        .passed
    ) {
      throw new CommandNotFoundError();
    }

    if (command instanceof ParentCommand)
      return this.showHelpForParentCommand(message, command);

    const commandName = command.friendlyNameWithParent || command.friendlyName;

    const variations = command.variations
      .map((v) => {
        const display =
          v.variation instanceof Array
            ? v.variation.map((v) => v.code()).join(", ")
            : v.variation.code();

        return `${display} ${v.description ? "- " + v.description : ""}`;
      })
      .join("\n");

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      commandName.strong() + ":",
      command.description.italic(false),
      "",
      {
        shouldDisplay: !!command.usage,
        string: flatDeep([command.usage])
          .map((u) => `${this.prefix}${commandName} ${u}`.trim().code())
          .join("\n"),
      },
      {
        shouldDisplay: !!command.aliases.length,
        string: `\n**Aliases**: ${command.aliases.map((a) => a.code())}\n`,
      },
      {
        shouldDisplay: !!command.variations.length,
        string: "**Variations**:\n" + variations,
      }
    );

    let embed = this.newEmbed()
      .setAuthor(
        `Help with ${commandName} for ${message.author.username}`,
        message.author.avatarURL() || ""
      )
      .setDescription(lineConsolidator.consolidate());

    return embed;
  }

  private async showHelpForParentCommand(
    message: Message,
    command: ParentCommand
  ) {
    let commands = await this.adminService.can.viewList(
      command.children.commands,
      message,
      this.gowonClient
    );

    const shortestPrefix =
      [command.prefixes].flat().sort((a, b) => a.length - b.length)[0] ||
      command.friendlyName;

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      command.friendlyName.strong() + ":",
      command.description.italic(),
      "",
      {
        shouldDisplay: !!command.prefixes,
        string:
          "**Prefixes**:\n" +
          flatDeep([command.prefixes])
            .map((p) => p.trim().code())
            .join(", ") +
          "\n",
      },
      "**Commands**:",
      commands
        .map(
          (c) =>
            `${shortestPrefix} ${c.friendlyName}`.code() +
            ` - ${c.description.split("\n")[0]}`
        )
        .join("\n")
    );

    return this.newEmbed()
      .setAuthor(
        `Help with ${command.friendlyName} for ${message.author.username}`,
        message.author.avatarURL() || ""
      )
      .setDescription(lineConsolidator.consolidate());
  }

  private async runCustomHelp(commandClass: Command) {
    let command = new commandClass.customHelp!();
    command.gowonClient = this.gowonClient;
    command.delegatedFrom = this;
    await command.execute(this.message, this.runAs);
    return;
  }
}
