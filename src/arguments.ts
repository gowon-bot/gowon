import { Message } from "discord.js";
import { BotMomentService } from "./services/BotMomentService";

export interface Slice {
  start: number;
  stop?: number;
}

export interface InputsOptions {
  stopChar?: string;
}

export interface InputArguments {
  index: number | Slice;
  splitOn?: string;
  regex?: RegExp;
  optional?: boolean;
  custom?: (messageString: string) => ParsedArgument;
}

export interface Arguments {
  mentions?: {
    [index: number]: {
      name: string;
      description?: string;
    };
  };
  inputs?: {
    [name: string]: InputArguments;
  };
}

export type ParsedArgument = any;

export interface ParsedArguments {
  [name: string]: ParsedArgument;
}

export class ArgumentParser {
  parsedArguments: ParsedArguments = {};
  botMomentService = BotMomentService.getInstance();
  arguments: Arguments;

  constructor(args: Arguments) {
    this.arguments = args;
  }

  parse(message: Message, runAs: string): ParsedArguments {
    let messageString = this.removeMentions(message.content).trim();

    let mentions = this.parseMentions(message);

    let inputs = this.parseInputs(
      this.botMomentService.removeCommandName(messageString, runAs)
    );

    this.parsedArguments = { ...mentions, ...inputs };

    return this.parsedArguments;
  }

  private removeMentions(string: string): string {
    return string.replace(/<@(!|&|#)?[0-9]+>/g, "");
  }

  private getElementFromIndex(
    array: Array<string>,
    index: number | Slice
  ): ParsedArgument {
    if (
      array.length <
      (typeof index === "number" ? index : index.stop || index.start)
    ) {
      return;
    }

    return typeof index === "number"
      ? array[index]?.trim()
      : (index.stop
          ? array.slice(index.start, index.stop + 1)
          : array.slice(index.start)
        )
          .map((e) => e?.trim())
          .join(" ");
  }

  private parseCustomInputs(messageString: string): ParsedArguments {
    if (this.arguments.inputs) {
      let parsedArguments = Object.keys(this.arguments.inputs!)
        .filter((arg) => !!this.arguments.inputs![arg].custom)
        .reduce((acc, arg) => {
          let argOptions = this.arguments.inputs![arg];
          if (argOptions.custom) {
            acc[arg] = argOptions.custom(messageString);
          }
          return acc;
        }, {} as ParsedArguments);

      return parsedArguments;
    } else return {};
  }

  private parseInputsWithSplit(
    messageString: string,
    splitFunction: (string: string, arg: InputArguments) => Array<string>,
    filter: (arg: InputArguments) => boolean
  ): ParsedArguments {
    if (this.arguments.inputs) {
      let argArray = Object.keys(this.arguments.inputs).filter((arg) =>
        filter(this.arguments.inputs![arg])
      );

      return argArray.reduce((acc: ParsedArguments, arg, idx) => {
        let argOptions = this.arguments.inputs![arg];
        let array = splitFunction(messageString, argOptions);

        acc[arg] = this.getElementFromIndex(array, argOptions.index);

        return acc;
      }, {} as ParsedArguments);
    } else return {};
  }

  private parseInputs(string: string): ParsedArguments {
    let genericArgs = this.parseInputsWithSplit(
      string,
      (string) => string.trim().split(/\s+/),
      (arg) => !arg.splitOn
    );

    let splitOnArgs = this.parseInputsWithSplit(
      string,
      (string, arg) => (string + " ").split(` ${arg?.splitOn} `),
      (arg) => !!arg.splitOn
    );

    let regexArgs = this.parseInputsWithSplit(
      string,
      (string, arg) => (string.match(arg.regex!) || []) as Array<string>,
      (arg) => !!arg.regex
    );

    let customArgs = this.parseCustomInputs(string);

    return { ...genericArgs, ...splitOnArgs, ...regexArgs, ...customArgs };
  }

  private parseMentions(message: Message): ParsedArguments {
    if (this.arguments.mentions) {
      return Object.keys(this.arguments.mentions).reduce((acc, arg, idx) => {
        if (this.arguments.mentions![idx]) {
          acc[
            this.arguments.mentions![idx].name
          ] = message.mentions.members?.array()[idx]?.user;
        }
        return acc;
      }, {} as ParsedArguments);
    }
    return {};
  }
}

export interface GroupedArguments {
  [split: string]: { name: string; index: number | Slice; optional: boolean }[];
}
export function groupArgumentsBySplit(args: Arguments): GroupedArguments {
  return Object.keys(args.inputs ?? {}).reduce((acc, argName) => {
    let arg = args.inputs![argName];

    if (!acc[arg.splitOn ?? " "]) acc[arg.splitOn ?? " "] = [];

    if (arg.splitOn) {
      acc[arg.splitOn].push({
        name: argName,
        index: arg.index,
        optional: arg.optional ?? false,
      });
    } else {
      acc[" "].push({
        name: argName,
        index: arg.index,
        optional: arg.optional ?? false,
      });
    }

    return acc;
  }, {} as GroupedArguments);
}
