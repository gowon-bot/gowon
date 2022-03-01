import { BaseCommand } from "../BaseCommand";
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { ArgumentsMap } from "../../context/arguments/types";
import { ChildCommand, ParentCommand } from "../ParentCommand";

export class SlashCommandConverter {
  convert(command: BaseCommand): SlashCommandBuilder {
    if (command instanceof ParentCommand) {
      return this.convertParentCommand(command);
    }

    let slashCommand = new SlashCommandBuilder()
      .setName((command.slashCommandName || command.name).toLowerCase())
      .setDescription(command.description);

    if (Object.keys(command.arguments).length) {
      slashCommand = this.convertArguments(slashCommand, command.arguments);
    }

    return slashCommand as SlashCommandBuilder;
  }

  // The typing here is a disaster
  // just ignore the `as any`s
  private convertSubcommand(
    command: ChildCommand,
    subcommand: SlashCommandSubcommandBuilder
  ): SlashCommandSubcommandBuilder {
    subcommand = subcommand
      .setName((command.slashCommandName || command.name).toLowerCase())
      .setDescription(command.description);

    if (Object.keys(command.arguments).length) {
      subcommand = this.convertArguments(
        subcommand as any,
        command.arguments
      ) as any;
    }

    return subcommand;
  }

  private convertArguments(
    slashCommand: SlashCommandBuilder,
    args: ArgumentsMap
  ) {
    let newSlashCommand = slashCommand;

    const sortedArguments = Object.entries(args)
      .sort(
        ([_, a], [__, b]) =>
          Number(b.options.required) - Number(a.options.required)
      )
      .filter(([_, arg]) => arg.options.slashCommandOption);

    for (const [argName, arg] of sortedArguments) {
      newSlashCommand = arg.addAsOption(
        newSlashCommand,
        argName.toLowerCase()
      ) as SlashCommandBuilder;
    }

    return newSlashCommand;
  }

  private convertParentCommand(command: ParentCommand): SlashCommandBuilder {
    let parentCommand = new SlashCommandBuilder()
      .setName(command.friendlyName)
      .setDescription(command.description);

    for (const childCommand of command.children.asDeepList()) {
      if (childCommand.slashCommand) {
        parentCommand = parentCommand.addSubcommand((subcommand) =>
          this.convertSubcommand(childCommand as ChildCommand, subcommand)
        ) as any;
      }
    }

    return parentCommand;
  }
}
