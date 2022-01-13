import { BaseCommand } from "../../lib/command/BaseCommand";
import { Arguments } from "../../lib/arguments/arguments";
import { AdminService } from "../../services/dbservices/AdminService";
import { CommandNotFoundError } from "../../errors";
import { flatDeep } from "../../helpers";
import { ParentCommand } from "../../lib/command/ParentCommand";
import { LineConsolidator } from "../../lib/LineConsolidator";
import { Command } from "../../lib/command/Command";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { Emoji } from "../../lib/Emoji";

const args = {
  inputs: {
    command: { index: { start: 0 } },
  },
} as const;

export default class HelpForOneCommand extends BaseCommand<typeof args> {
  idSeed = "clc seungyeon";

  shouldBeIndexed = false;

  arguments: Arguments = args;

  adminService = ServiceRegistry.get(AdminService);

  ctx = this.generateContext({
    adminService: this.adminService,
  });

  async run() {
    const command = this.parsedArguments.command!;

    const embed = await this.helpForOneCommand(command);

    if (!embed) return;

    await this.send(embed);
  }

  private async helpForOneCommand(input: string) {
    const { command } = await this.commandRegistry.find(input, this.guild.id);

    if (!command) throw new CommandNotFoundError();

    if (command.customHelp) {
      this.runCustomHelp(command);
      return;
    }

    if (!(await this.adminService.can.run(this.ctx, command)).passed) {
      throw new CommandNotFoundError();
    }

    if (command instanceof ParentCommand)
      return this.showHelpForParentCommand(command);

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
      (command.access?.role ? `${Emoji[command.access.role]} ` : "") +
        commandName.strong() +
        ":",
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
        string:
          (command.usage ? "\n" : "") +
          `**Aliases**: ${command.aliases.map((a) => a.code())}\n`,
      },
      {
        shouldDisplay: !!command.variations.length,
        string:
          "**Variations**:\n" +
          variations +
          (command.arguments.flags ? "\n" : ""),
      },
      {
        shouldDisplay: !!command.arguments.flags,
        string:
          "**Flags**:\n" +
          Object.values(command.arguments?.flags || {})
            .map(
              (f) =>
                `${[
                  ...f.longnames.map((n) => `--${n}`),
                  ...f.shortnames.map((n) => `-${n}`),
                ]
                  .map((flag) => flag.code())
                  .join(", ")} - ${f.description}`
            )
            .join("\n"),
      }
    );

    let embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor(`Help with ${commandName}`))
      .setDescription(lineConsolidator.consolidate());

    return embed;
  }

  private async showHelpForParentCommand(command: ParentCommand) {
    const commands = await this.adminService.can.viewList(
      this.ctx,
      command.children.commands
    );

    const shortestPrefix =
      [command.prefixes].flat().sort((a, b) => a.length - b.length)[0] ||
      command.friendlyName;

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      (command.access?.role ? `${Emoji[command.access.role]} ` : "") +
        command.friendlyName.strong() +
        ":",
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
      .setAuthor(this.generateEmbedAuthor(`Help with ${command.friendlyName}`))
      .setDescription(lineConsolidator.consolidate());
  }

  private async runCustomHelp(commandClass: Command) {
    let command = new commandClass.customHelp!();
    command.setClient(this.gowonClient);
    command.delegatedFrom = this;
    await command.execute(this.message, this.runAs);
    return;
  }
}
