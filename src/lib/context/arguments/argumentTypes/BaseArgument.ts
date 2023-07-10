import chalk from "chalk";
import {
  BaseInteraction,
  CommandInteraction,
  Message,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";
import { ArgumentNotImplementedForInteractionTypeError } from "../../../../errors/gowon";
import { toInt } from "../../../../helpers/lastfm/";
import { GowonService } from "../../../../services/GowonService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { ArgumentValidationError } from "../../../validation/validators/BaseValidator";
import { GowonContext } from "../../Context";
import { Slice } from "../types";
import {
  SlashCommandBuilder,
  SlashCommandBuilderReturn,
  SlashCommandOption,
} from "./SlashCommandTypes";

type GetElementFromIndexOptions<
  T,
  O extends GetElementFromIndexOptions<T, any>
> = {
  join?: boolean;
  default?: UnWrapGetElementOptions<T, O>;
  number?: boolean;
  trim?: boolean;
};

type UnWrapGetElementOptions<
  T,
  O extends GetElementFromIndexOptions<T, any>
> = O extends { number: true } ? number : T;

export interface BaseArgumentOptions<ReturnT = any> {
  required:
    | boolean
    | {
        customMessage: string;
      };
  description: string;
  slashCommandOption: boolean;
  default?: ReturnT | (() => ReturnT);
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
  : OptionsT extends { default: T } | { default: () => T }
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

  protected get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor(options: ProvidedOptionsT) {
    this.options = {
      ...defaultBaseOptions,
      ...options,
    } as any as OptionsT;
  }

  abstract parseFromMessage(
    message: Message,
    content: string,
    context: GowonContext
  ): ReturnT | undefined;

  parseFromInteraction(
    interaction: BaseInteraction,
    ctx: GowonContext,
    argumentName: string
  ): ReturnT | undefined {
    if (interaction.isCommand()) {
      return this.parseFromCommandInteraction(interaction, ctx, argumentName);
    } else if (interaction.isModalSubmit()) {
      return this.parseFromModalSubmitInteraction(
        interaction,
        ctx,
        argumentName
      );
    } else if (interaction.isStringSelectMenu()) {
      return this.parseFromStringSelectInteraction(
        interaction,
        ctx,
        argumentName
      );
    }

    return undefined;
  }

  parseFromCommandInteraction(
    _interaction: CommandInteraction,
    _ctx: GowonContext,
    _argumentName: string
  ): ReturnT | undefined {
    throw new ArgumentNotImplementedForInteractionTypeError();
  }

  parseFromModalSubmitInteraction(
    _interaction: ModalSubmitInteraction,
    _ctx: GowonContext,
    _argumentName: string
  ): ReturnT | undefined {
    throw new ArgumentNotImplementedForInteractionTypeError();
  }

  parseFromStringSelectInteraction(
    _interaction: StringSelectMenuInteraction,
    _ctx: GowonContext,
    _argumentName: string
  ): ReturnT | undefined {
    throw new ArgumentNotImplementedForInteractionTypeError();
  }

  addAsOption(
    slashCommand: SlashCommandBuilder,
    _argName: string
  ): SlashCommandBuilderReturn {
    return slashCommand;
  }

  validate(value: ReturnT | undefined, argumentName: string) {
    if (
      this.options.required &&
      (value === null || value === undefined || (value as any) === "")
    ) {
      throw new ArgumentValidationError(
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
    const cleanContent = this.gowonService.removeCommandName(ctx, content);

    return cleanContent.replace(/<(@|#)(!|&)?[0-9]+>/g, "");
  }

  protected getElementFromIndex<
    T,
    O extends Partial<GetElementFromIndexOptions<T, O>>
  >(
    array: Array<T>,
    index: number | Slice,
    options: O = {} as O
  ): UnWrapGetElementOptions<T, O> | undefined {
    if (index === undefined) return undefined;

    if (this.shouldReturnDefault(array, index)) {
      return this.getDefault() as UnWrapGetElementOptions<T, O>;
    }

    options.join = options.join || false;

    let argument: any;

    if (typeof index === "number") {
      argument = this.getIndexWithNumber(array, index, options);
    } else {
      const elements = this.getIndexWithSlice(array, index);

      argument = options.join ? elements.join(" ") : elements;
    }

    if (options.number) {
      return (
        isNaN(toInt(argument)) ? this.getDefault() : toInt(argument)
      ) as UnWrapGetElementOptions<T, O>;
    } else if (typeof argument === "string" && options.trim) {
      return argument.trim() as UnWrapGetElementOptions<T, O>;
    } else {
      return argument ?? this.getDefault();
    }
  }

  protected getDefault(): ReturnT | undefined {
    if (this.options.default instanceof Function) {
      return this.options.default();
    } else return this.options.default;
  }

  private shouldReturnDefault(array: any[], index: number | Slice): boolean {
    return (
      array.length <
      (typeof index === "number" ? index : index.stop || index.start)
    );
  }

  private getIndexWithNumber<
    T,
    O extends Partial<GetElementFromIndexOptions<T, O>>
  >(array: T[], index: number, options: O): UnWrapGetElementOptions<T, O> {
    return ((typeof array[index] === "string"
      ? (array[index] as string).trim()
      : array[index]) ?? options.default) as UnWrapGetElementOptions<T, O>;
  }

  private getIndexWithSlice<
    T,
    O extends Partial<GetElementFromIndexOptions<T, O>>
  >(array: T[], index: Slice): UnWrapGetElementOptions<T, O>[] {
    const slicedArray = index.stop
      ? array.slice(index.start, index.stop + 1)
      : array.slice(index.start);

    const trimmedArray = slicedArray.map((e) =>
      typeof e === "string" ? e?.trim() : e
    ) as UnWrapGetElementOptions<T, O>[];

    const defaultReturn = this.getDefault();

    if (index.start && index.stop) {
      for (let i = 0; i < index.stop - index.start + 1; i++) {
        if (!trimmedArray[i]) {
          trimmedArray[i] =
            defaultReturn instanceof Array
              ? (defaultReturn || [])[i]
              : defaultReturn;
        }
      }
    } else if (defaultReturn && defaultReturn instanceof Array) {
      for (let i = 0; i < defaultReturn.length; i++) {
        const def = defaultReturn[i];

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

export interface ModalArgumentOptions {
  modalFieldID: string;
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
