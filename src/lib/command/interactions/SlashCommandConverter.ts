import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { PermissionFlagsBits } from "discord-api-types/v9";
import { ArgumentsMap } from "../../context/arguments/types";
import { ChildCommand } from "../ChildCommand";
import { Command, Variation } from "../Command";
import { ParentCommand } from "../ParentCommand";
import { ConvertedSlashCommand } from "./ConvertedSlashCommand";

export class SlashCommandConverter {
  convert(command: Command, asVariation?: Variation): ConvertedSlashCommand[] {
    if (command instanceof ParentCommand) {
      return [this.convertParentCommand(command)];
    }

    let slashCommand = new SlashCommandBuilder()
      .setDefaultMemberPermissions(
        command.adminCommand ? PermissionFlagsBits.Administrator : undefined
      )
      .setDMPermission(!command.guildRequired)
      .setName(
        (
          asVariation?.name ||
          command.slashCommandName ||
          command.name
        ).toLowerCase()
      )
      .setDescription(asVariation?.description || command.description);

    if (Object.keys(command.arguments).length) {
      slashCommand = this.convertArguments(
        slashCommand,
        asVariation?.overrideArgs || command.arguments
      );
    }

    const variations = this.getSeparateVariations(command);

    const convertedSlashCommand = new ConvertedSlashCommand(
      slashCommand
    ).setUserInstallable(!command.guildRequired);

    // Break the variation recursion
    if (variations.length && !asVariation) {
      return [
        convertedSlashCommand,
        ...this.convertVariations(command, variations),
      ];
    }

    return [convertedSlashCommand];
  }

  // The typing here is a disaster
  // just ignore the `as any`s
  private convertSubcommand(
    command: ChildCommand,
    subcommand: SlashCommandSubcommandBuilder,
    asVariation?: Variation
  ): SlashCommandSubcommandBuilder {
    subcommand = subcommand
      .setName(
        (
          asVariation?.name ||
          command.slashCommandName ||
          command.name
        ).toLowerCase()
      )
      .setDescription(asVariation?.description || command.description);

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

  private convertParentCommand(command: ParentCommand): ConvertedSlashCommand {
    let parentCommand = new SlashCommandBuilder()
      .setDefaultPermission(!(command.devCommand || command.adminCommand))
      .setName(command.friendlyName)
      .setDescription(command.description);

    for (const childCommand of command.children.asDeepList() as ChildCommand[]) {
      if (childCommand.slashCommand) {
        parentCommand = parentCommand.addSubcommand((subcommand) =>
          this.convertSubcommand(childCommand, subcommand)
        ) as any;

        for (const variation of this.getSeparateVariations(childCommand)) {
          parentCommand = parentCommand.addSubcommand((subcommand) =>
            this.convertSubcommand(childCommand, subcommand, variation)
          ) as any;
        }
      }
    }

    return new ConvertedSlashCommand(parentCommand);
  }

  private getSeparateVariations(command: Command): Variation[] {
    return (command.variations || []).filter((v) => !!v.separateSlashCommand);
  }

  private convertVariations(
    command: Command,
    variations: Variation[]
  ): ConvertedSlashCommand[] {
    const slashCommands: ConvertedSlashCommand[] = [];

    for (const variation of variations) {
      slashCommands.push(...this.convert(command, variation));
    }

    return slashCommands;
  }
}
