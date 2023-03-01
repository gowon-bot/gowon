import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";
import { toInt } from "../../../../helpers/lastFM";
import { GowonService } from "../../../../services/GowonService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { isDuration } from "../../../timeAndDate/durations";
import { GowonContext } from "../../Context";
import {
  BaseArgument,
  BaseArgumentOptions,
  defaultIndexableOptions,
  IndexableArgumentOptions,
} from "./BaseArgument";

export interface NumberArgumentOptions
  extends BaseArgumentOptions,
    IndexableArgumentOptions {
  default?: number;
}

export class NumberArgument<
  OptionsT extends Partial<NumberArgumentOptions>
> extends BaseArgument<number, NumberArgumentOptions, OptionsT> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor(options?: OptionsT) {
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): number | undefined {
    const cleanContent = this.cleanContent(ctx, content);

    const split = this.filterTimeRanges(cleanContent.split(/\s+/));

    const numbers = this.getNumbersFromSplit(split);

    return (
      this.getElementFromIndex(numbers, this.options.index) ||
      this.options.default
    );
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): number | undefined {
    return interaction.options.getInteger(argumentName) || this.options.default;
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addIntegerOption((option) =>
      this.baseOption(option, argumentName)
    );
  }

  private getNumbersFromSplit(split: string[]): number[] {
    const numbers = [] as number[];
    const numberRegex = /[\d,]+k?/gi;

    for (const numberString of split) {
      if (numberRegex.test(numberString)) {
        numbers.push(
          toInt(numberString.replaceAll(",", "").replaceAll("k", "000"))
        );
      }
    }

    return numbers;
  }

  private filterTimeRanges(splits: string[]): string[] {
    const filtered = [] as string[];

    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];

      if (i + 1 < splits.length) {
        const splitAhead = splits[i + 1];

        if (isDuration(splitAhead)) {
          // Skip this and the next split
          i++;
          continue;
        }
      }

      filtered.push(split);
    }

    return filtered;
  }
}
