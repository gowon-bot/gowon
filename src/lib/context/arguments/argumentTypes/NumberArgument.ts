import { Message } from "discord.js";
import { toInt } from "../../../../helpers/lastFM";
import { GowonService } from "../../../../services/GowonService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { isDuration } from "../../../timeAndDate/durations";
import { GowonContext } from "../../Context";
import {
  BaseArgument,
  defaultIndexableOptions,
  IndexableArgumentOptions,
} from "./BaseArgument";

export interface NumberArgumentOptions extends IndexableArgumentOptions {
  default?: number;
}

export class NumberArgument extends BaseArgument<
  number,
  NumberArgumentOptions
> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor(options: Partial<NumberArgumentOptions> = {}) {
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(_: Message, content: string, context: GowonContext): number {
    const cleanContent = this.gowonService.removeCommandName(
      content,
      context.runAs,
      context.guild.id
    );

    const split = this.filterTimeRanges(cleanContent.split(/\s+/));

    const numbers = this.getNumbersFromSplit(split);

    return (
      this.getElementFromIndex(numbers, this.options.index) ||
      this.options.default
    );
  }

  parseFromInteraction(): number {
    return NaN;
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
