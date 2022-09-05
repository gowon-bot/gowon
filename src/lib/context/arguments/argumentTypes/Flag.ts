import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";
import { GowonContext } from "../../Context";
import { FlagOptions, FlagParser } from "../parsers/FlagParser";
import { ArgumentsMap } from "../types";
import {
  BaseArgument,
  BaseArgumentOptions,
  StringCleaningArgument,
} from "./BaseArgument";

export interface FlagArgumentOptions extends BaseArgumentOptions, FlagOptions {}

export class Flag
  extends BaseArgument<boolean, FlagArgumentOptions>
  implements StringCleaningArgument
{
  private flagParser = new FlagParser();

  constructor(options: Partial<FlagArgumentOptions> = {}) {
    super({ shortnames: [], longnames: [], description: "" }, options);
  }

  parseFromMessage(_: Message, content: string): boolean {
    return this.flagParser.parse(this.options, content);
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): boolean {
    return interaction.options.getBoolean(argumentName)!;
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addBooleanOption((option) =>
      this.baseOption(option, argumentName)
    );
  }

  public clean(string: string): string {
    return this.flagParser.clean(this.options, string);
  }
}

export function isFlag(argument: BaseArgument<any>): argument is Flag {
  return argument instanceof Flag;
}

export function argumentsHasFlags(args: ArgumentsMap): boolean {
  return Object.values(args).some((a) => isFlag(a));
}
