import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";
import escapeStringRegexp from "escape-string-regexp";
import { ArgumentValidationError } from "../../../validation/validators/BaseValidator";
import { GowonContext } from "../../Context";
import {
  BaseArgument,
  BaseArgumentOptions,
  ContentBasedArgumentOptions,
  SliceableArgumentOptions,
  defaultContentBasedOptions,
  defaultIndexableOptions,
  isCustomMessage as hasCustomMessage,
} from "./BaseArgument";

export interface Choice {
  name: string;
  value?: string;
}

export interface StringArgumentOptions
  extends BaseArgumentOptions<string>,
    SliceableArgumentOptions,
    ContentBasedArgumentOptions {
  splitOn: string | RegExp;
  regex: RegExp;
  match: string[];
  choices:
    | Choice[]
    | string[]
    | { list: Choice[] | string[]; customMessage: string };
  unstrictChoices: boolean;
}

export class StringArgument<
  OptionsT extends Partial<StringArgumentOptions>
> extends BaseArgument<string, StringArgumentOptions, OptionsT> {
  constructor(options?: OptionsT) {
    super({
      ...defaultIndexableOptions,
      ...defaultContentBasedOptions,
      splitOn: /\s+/,
      match: [],
      choices: [],
      ...(options ?? {}),
    } as OptionsT);
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): string | undefined {
    const cleanContent = this.options.preprocessor(
      this.cleanContent(ctx, content)
    );

    let parsedArgument: string | undefined;

    if (this.options.match.length) {
      const regex = new RegExp(
        `(?:\\b|$)${this.options.match
          .map((m) => escapeStringRegexp(m))
          .join("|")}(?:\\b|^)`,
        "gi"
      );

      parsedArgument = this.parseFromRegex(content, regex);
    } else if (this.options.regex) {
      parsedArgument = this.parseFromRegex(content, this.options.regex);
    } else {
      const splitContent = cleanContent.split(this.options.splitOn);

      parsedArgument = this.getElementFromIndex(
        splitContent,
        this.options.index,
        {
          join: true,
          trim: true,
        }
      );
    }

    return parsedArgument;
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): string | undefined {
    return interaction.options.getString(argumentName) ?? undefined;
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addStringOption((option) => {
      let newOption = this.baseOption(option, argumentName);

      if (this.getChoices(this.options).length) {
        newOption = newOption.addChoices(
          ...this.getChoices(this.options)
        ) as SlashCommandStringOption;
      }

      return newOption;
    });
  }

  private parseFromRegex(content: string, regex: RegExp): string {
    const matches = Array.from(content.matchAll(regex) || []);

    const match = this.getElementFromIndex(
      matches.map((m) => m[0]),
      this.options.index
    );

    return match ?? "";
  }

  validate(value: string | undefined, argumentName: string) {
    super.validate(value, argumentName);

    const choices = this.getChoices(this.options);

    if (
      value &&
      choices.length &&
      !this.options.unstrictChoices &&
      !choices.some((c) => c.value.toLowerCase() === value.toLowerCase())
    ) {
      throw new ArgumentValidationError(
        hasCustomMessage(this.options.choices)
          ? this.options.choices.customMessage
          : `${argumentName} must be one of ${this.getChoices(this.options)
              .map((c) => c.value)
              .join(", ")}`
      );
    }
  }

  private getChoices(
    options: StringArgumentOptions
  ): { name: string; value: string }[] {
    const choices = [] as { name: string; value: string }[];

    const choicesOptions = hasCustomMessage(options.choices)
      ? options.choices.list
      : options.choices;

    for (const choice of choicesOptions) {
      if (typeof choice === "string") {
        choices.push({ name: choice, value: choice });
      } else {
        choices.push({ name: choice.name, value: choice.value || choice.name });
      }
    }

    return choices;
  }
}
