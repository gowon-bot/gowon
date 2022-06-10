import { Interaction, Message } from "discord.js";
import { toInt } from "../../../../helpers/lastFM";
import { Slice } from "../types";
import { GowonContext } from "../../Context";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { GowonService } from "../../../../services/GowonService";
import {
  SlashCommandBuilder,
  SlashCommandBuilderReturn,
  SlashCommandOption,
} from "./SlashCommandTypes";
import { ValidationError } from "../../../validation/validators/BaseValidator";
import chalk from "chalk";

type GetElementFromIndexOptions = {
  join?: boolean;
  default?: any | any[];
  number?: boolean;
  trim?: boolean;
};

export interface BaseArgumentOptions<ReturnT = any> {
  required:
    | boolean
    | {
        customMessage: string;
      };
  description: string;
  slashCommandOption: boolean;
  default?: ReturnT;
}

const defaultDescription = "This argument doesn't have a description yet";

export const defaultBaseOptions: BaseArgumentOptions = {
  required: false,
  description: defaultDescription,
  slashCommandOption: true,
};
export const defaultIndexableOptions: IndexableArgumentOptions = { index: 0 };
export const defaultContentBasedOptions: ContentBasedArgumentOptions = {
  preprocessor: (content: string) => content,
};

export type ArgumentReturnType<T, OptionsT> = OptionsT extends {
  required: true;
}
  ? T
  : OptionsT extends { default: T }
  ? T
  : OptionsT extends { required: { customMessage: string } }
  ? T
  : T | undefined;

export abstract class BaseArgument<
  ReturnT,
  OptionsT extends BaseArgumentOptions<ReturnT> = BaseArgumentOptions<ReturnT>,
  ProvidedOptionsT extends Partial<OptionsT> = {}
> {
  public mention = false;
  public options: OptionsT;

  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor(...options: (ProvidedOptionsT | {})[]) {
    this.options = {} as any;

    for (const option of [defaultBaseOptions, ...options]) {
      this.options = Object.assign(this.options, option);
    }
  }

  abstract parseFromMessage(
    message: Message,
    content: string,
    context: GowonContext
  ): ReturnT | undefined;

  abstract parseFromInteraction(
    interaction: Interaction,
    context: GowonContext,
    argumentName: string
  ): ReturnT | undefined;

  addAsOption(
    slashCommand: SlashCommandBuilder,
    _: string
  ): SlashCommandBuilderReturn {
    return slashCommand;
  }

  validate(value: ReturnT | undefined, argumentName: string) {
    if (
      this.options.required &&
      (value === null || value === undefined || (value as any) === "")
    ) {
      throw new ValidationError(
        isCustomMessage(this.options.required)
          ? this.options.required.customMessage
          : `Please enter a${
              startsWithVowel(argumentName) ? "n" : ""
            } ${argumentName}!`
      );
    }
  }

  protected baseOption<
    OptionType extends SlashCommandOption = SlashCommandOption
  >(option: OptionType, argumentName: string): OptionType {
    if (this.options.description === defaultDescription) {
      console.log(
        chalk`{yellow WARNING: Description for option ${argumentName} not provided}`
      );
    }

    return option
      .setName(argumentName)
      .setDescription(this.options.description.slice(0, 99))
      .setRequired(!!this.options.required) as OptionType;
  }

  protected cleanContent(ctx: GowonContext, content: string): string {
    let cleanContent = this.gowonService.removeCommandName(
      content,
      ctx.runAs,
      ctx.requiredGuild.id
    );

    return cleanContent.replace(/<(@|#)(!|&)?[0-9]+>/g, "");
  }

  protected getElementFromIndex(
    array: Array<any>,
    index: number | Slice,
    options: GetElementFromIndexOptions = {}
  ): any {
    if (index === undefined) return undefined;
    if (this.shouldReturnDefault(array, index)) return options.default;

    options.join = options.join || false;

    let argument: any;

    if (typeof index === "number") {
      argument = this.getIndexWithNumber(array, index, options);
    } else {
      const elements = this.getIndexWithSlice(array, index, options);

      argument = options.join ? elements.join(" ") : elements;
    }

    if (options.number) {
      return isNaN(toInt(argument)) ? options.default : toInt(argument);
    } else if (typeof argument === "string" && options.trim) {
      return argument.trim();
    } else {
      return argument ?? options.default;
    }
  }

  private shouldReturnDefault(array: any[], index: number | Slice): boolean {
    return (
      array.length <
      (typeof index === "number" ? index : index.stop || index.start)
    );
  }

  private getIndexWithNumber(
    array: any[],
    index: number,
    options: GetElementFromIndexOptions
  ): any {
    return (
      (typeof array[index] === "string"
        ? array[index]?.trim()
        : array[index]) ?? options.default
    );
  }

  private getIndexWithSlice(
    array: any[],
    index: Slice,
    options: GetElementFromIndexOptions
  ): any {
    const slicedArray = index.stop
      ? array.slice(index.start, index.stop + 1)
      : array.slice(index.start);

    const trimmedArray = slicedArray.map((e) =>
      typeof e === "string" ? e?.trim() : e
    );

    if (index.start && index.stop) {
      for (let i = 0; i < index.stop - index.start + 1; i++) {
        if (!trimmedArray[i]) trimmedArray[i] = (options.default || [])[i];
      }
    } else {
      for (let i = 0; i < options.default?.length; i++) {
        const def = options.default[i];

        if (!trimmedArray[i]) trimmedArray[i] = def;
      }
    }

    return trimmedArray.length === 1
      ? trimmedArray.filter((e) => !!e)
      : trimmedArray.filter((e) => (e ?? undefined) !== undefined);
  }
}

export interface IndexableArgumentOptions {
  index: number;
}

export interface SliceableArgumentOptions {
  index: number | Slice;
}

export interface ContentBasedArgumentOptions {
  preprocessor: (content: string) => string;
}

export type StringCleaningArgument = {
  clean(string: string): string;
};

export function isStringCleaning(
  argument: any
): argument is StringCleaningArgument {
  return argument.clean instanceof Function;
}

export function isCustomMessage(
  value: any | { customMessage: string } | undefined
): value is { customMessage: string } {
  return !!value && !!(value as any).customMessage;
}

export function startsWithVowel(string: string): boolean {
  const blacklist = ["username"];

  if (blacklist.includes(string)) return false;

  return ["a", "e", "i", "u", "o"].some((vowel) => string.startsWith(vowel));
}
