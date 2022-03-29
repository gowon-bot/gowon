import { Command } from "../../lib/command/Command";
import { CommandNotFoundError } from "../../errors/errors";
import { flatDeep } from "../../helpers";
import { ParentCommand } from "../../lib/command/ParentCommand";
import { LineConsolidator } from "../../lib/LineConsolidator";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { Emoji } from "../../lib/Emoji";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { Flag, isFlag } from "../../lib/context/arguments/argumentTypes/Flag";
import { BaseArgument } from "../../lib/context/arguments/argumentTypes/BaseArgument";
import { bold, code, italic } from "../../helpers/discord";
import { PermissionsService } from "../../lib/permissions/PermissionsService";

const args = {
  command: new StringArgument({ index: { start: 0 }, required: true }),
} as const;

export default class HelpForOneCommand extends Command<typeof args> {
  idSeed = "clc seungyeon";

  shouldBeIndexed = false;

  arguments = args;

  permissionsService = ServiceRegistry.get(PermissionsService);

  async run() {
    const command = this.parsedArguments.command;

    const embed = await this.helpForOneCommand(command);

    if (!embed) return;

    await this.send(embed);
  }

  private async helpForOneCommand(input: string) {
    const { command } = await this.commandRegistry.find(
      input,
      this.requiredGuild.id
    );

    if (!command) throw new CommandNotFoundError();

    if (command.customHelp) {
      this.runCustomHelp(command);
      return;
    }

    const canCheck = await this.permissionsService.canRunInContext(
      this.ctx,
      command
    );

    if (!canCheck.allowed) {
      throw new CommandNotFoundError();
    }

    if (command instanceof ParentCommand)
      return this.showHelpForParentCommand(command);

    const commandName = command.friendlyNameWithParent || command.friendlyName;

    const variations = command.variations
      .map((v) => {
        const display =
          v.variation instanceof Array
            ? v.variation.map((v) => code(v)).join(", ")
            : code(v.variation);

        return `${display} ${v.description ? "- " + v.description : ""}`;
      })
      .join("\n");

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      (command.access?.role ? `${Emoji[command.access.role]} ` : "") +
        bold(commandName) +
        (command.slashCommand ? " (slash command)" : "") +
        ":",

      italic(command.description + command.extraDescription, false),
      "",
      {
        shouldDisplay: !!command.usage,
        string: flatDeep([command.usage])
          .map((u) => code(`${this.prefix}${commandName} ${u}`.trim()))
          .join("\n"),
      },
      {
        shouldDisplay: !!command.aliases.length,
        string:
          (command.usage ? "\n" : "") +
          `**Aliases**: ${command.aliases.map((a) => code(a))}\n`,
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
          (
            Object.values(command.arguments || {}).filter((a) =>
              isFlag(a as BaseArgument<any, any>)
            ) as Flag[]
          )
            .map(
              (f) =>
                `${[
                  ...f.options.longnames.map((n) => `--${n}`),
                  ...f.options.shortnames.map((n) => `-${n}`),
                ]
                  .map((flag) => code(flag))
                  .join(", ")} - ${f.options.description}`
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
    const rawCommands = command.children.commands;

    const canChecks = await this.permissionsService.canListInContext(
      this.ctx,
      rawCommands
    );

    const commands = canChecks.filter((c) => c.allowed).map((cc) => cc.command);

    const shortestPrefix =
      [command.prefixes].flat().sort((a, b) => a.length - b.length)[0] ||
      command.friendlyName;

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      (command.access?.role ? `${Emoji[command.access.role]} ` : "") +
        bold(command.friendlyName) +
        ":",
      italic(command.description),
      "",
      {
        shouldDisplay: !!command.prefixes,
        string:
          "**Prefixes**:\n" +
          flatDeep([command.prefixes])
            .map((p) => code(p.trim()))
            .join(", ") +
          "\n",
      },

      "**Commands**:",
      commands
        .map(
          (c) =>
            code(`${shortestPrefix} ${c.friendlyName}`) +
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
    command.redirectedFrom = this;
    await command.execute(this.ctx);
    return;
  }
}
