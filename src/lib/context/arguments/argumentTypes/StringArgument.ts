import { CommandInteraction, Message } from "discord.js";
import escapeStringRegexp from "escape-string-regexp";
import { GowonContext } from "../../Context";
import {
  ArgumentReturnType,
  BaseArgument,
  BaseArgumentOptions,
  ContentBasedArgumentOptions,
  defaultContentBasedOptions,
  defaultIndexableOptions,
  SliceableArgumentOptions,
} from "./BaseArgument";
import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "@discordjs/builders";
import { ValidationError } from "../../../validation/validators/BaseValidator";

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
  choices: Choice[] | string[];
}

export class StringArgument<
  OptionsT extends Partial<StringArgumentOptions> = {}
> extends BaseArgument<
  ArgumentReturnType<string, OptionsT>,
  StringArgumentOptions,
  OptionsT
> {
  constructor(options: OptionsT | {} = {}) {
    super(
      defaultIndexableOptions as OptionsT,
      defaultContentBasedOptions as OptionsT,
      { splitOn: /\s+/, match: [], choices: [] } as any,
      options
    );
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): ArgumentReturnType<string, OptionsT> {
    const cleanContent = this.cleanContent(ctx, content);

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
        }
      );
    }

    this.validate(parsedArgument);

    return parsedArgument!;
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): string {
    return interaction.options.getString(argumentName)!;
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addStringOption((option) => {
      let newOption = this.baseOption(option, argumentName);

      if (this.options.choices.length) {
        newOption = newOption.addChoices(
          this.getChoices(this.options)
        ) as SlashCommandStringOption;
      }

      return newOption;
    });
  }

  private parseFromRegex(content: string, regex: RegExp): string {
    const matches = Array.from(content.matchAll(regex) || []);

    const match = this.getElementFromIndex(matches, this.options.index);

    if (match && typeof match[0] === "string") {
      return match[0];
    } else return "";
  }

  protected validate(value: string | undefined) {
    super.validate(value);

    if (
      value &&
      this.options.choices.length &&
      !this.options.choices.some((c) =>
        typeof c === "string"
          ? c.toLowerCase() === value.toLowerCase()
          : value?.toLowerCase() === (c.value || c.name).toLowerCase()
      )
    ) {
      throw new ValidationError("Not a choice");
    }
  }

  private getChoices(options: StringArgumentOptions): [string, string][] {
    const choices = [] as [string, string][];

    for (const choice of options.choices) {
      if (typeof choice === "string") choices.push([choice, choice]);
      else choices.push([choice.name, choice.value || choice.name]);
    }

    return choices;
  }
}
