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

export class Flag<OptionsT extends Partial<FlagArgumentOptions>>
  extends BaseArgument<boolean, FlagArgumentOptions, OptionsT>
  implements StringCleaningArgument
{
  private flagParser = new FlagParser();

  constructor(options?: OptionsT) {
    super({
      shortnames: [],
      longnames: [],
      description: "",
      ...(options ?? {}),
    } as OptionsT);
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

  public isDebug(): boolean {
    return this.options.longnames.includes("debug");
  }
}

export function isFlag(argument: BaseArgument<any>): argument is Flag<any> {
  return argument instanceof Flag;
}

export function argumentsHasFlags(args: ArgumentsMap): boolean {
  return Object.values(args).some((a) => isFlag(a));
}
