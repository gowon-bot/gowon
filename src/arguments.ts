import { Message, User } from "discord.js";

const extractArgs = (string: string, runAs: string) =>
  string.replace(`!${runAs}`, "").trim();

export interface ArgumentOptions {}

export interface Slice {
  start: number;
  stop: number;
}

export interface InputsOptions {
  stopChar?: string;
}

export interface Arguments {
  mentions?: {
    [index: number]: {
      name: string;
      description?: string;
    };
  };
  inputs?: {
    [name: string]: { index: number | Slice; splitOn?: string, optional?: boolean};
  };
}

export interface ParsedArguments {
  [name: string]: string | Array<string> | User | undefined;
}

export class ArgumentParser {
  parsedArguments: ParsedArguments = {};

  private removeMentions(string: string): string {
    return string.replace(/<@(!|&|#)?[0-9]+>/, "");
  }

  private getElementFromIndex(array: Array<string>, index: number | Slice) {
    return typeof index === "number"
      ? array[index]
      : array.slice(index.start, index.stop + 1);
  }

  private parseInputs(args: Arguments, string: string): ParsedArguments {
    let stringArray = string.split(/\s+/);

    let parsedGenericArgs: ParsedArguments = {},
      parsedSplitArgs: ParsedArguments = {};

    if (args.inputs) {
      let genericArgs = Object.keys(args.inputs).filter(
        (arg) => !args.inputs![arg]?.splitOn
      );

      parsedGenericArgs = genericArgs.reduce(
        (acc: ParsedArguments, arg, idx) => {
          if (!args.inputs) return acc;

          let argOptions = args.inputs[arg];

          acc[arg] = this.getElementFromIndex(stringArray, argOptions.index);

          return acc;
        },
        {} as ParsedArguments
      );

      let splitArgs = Object.keys(args.inputs).filter(
        (arg) => !!args.inputs![arg]?.splitOn
      );

      parsedSplitArgs = splitArgs.reduce((acc: ParsedArguments, arg, idx) => {
        let argOptions = args.inputs![arg];

        let splitStringArray = string.split(` ${argOptions?.splitOn} `);

        acc[arg] = this.getElementFromIndex(splitStringArray, argOptions.index);

        return acc;
      }, {} as ParsedArguments);
    }

    return { ...parsedGenericArgs, ...parsedSplitArgs };
  }

  private parseMentions(args: Arguments, message: Message): ParsedArguments {
    if (args.mentions) {
      return Object.keys(args.mentions).reduce((acc, arg, idx) => {
        if (args.mentions![idx]) {
          acc[args.mentions![idx].name] = message.mentions.members?.array()[
            idx
          ]?.user;
        }
        return acc;
      }, {} as ParsedArguments);
    }
    return {};
  }

  parse(message: Message, args: Arguments, runAs: string): ParsedArguments {
    let messageString = this.removeMentions(message.content).trim();

    let mentions = this.parseMentions(args, message);

    let inputs = this.parseInputs(args, extractArgs(messageString, runAs));

    this.parsedArguments = { ...mentions, ...inputs };

    return this.parsedArguments;
  }
}

export interface GroupedArguments {
  [split: string]: { name: string; index: number | Slice, optional: boolean }[];
}
export function groupArgumentsBySplit(args: Arguments): GroupedArguments {
  return Object.keys(args.inputs ?? {}).reduce((acc, argName) => {
    let arg = args.inputs![argName];

    if (!acc[arg.splitOn ?? " "]) acc[arg.splitOn ?? " "] = [];

    if (arg.splitOn) {
      acc[arg.splitOn].push({ name: argName, index: arg.index, optional: arg.optional ?? false });
    } else {
      acc[" "].push({ name: argName, index: arg.index, optional: arg.optional ?? false });
    }

    return acc;
  }, {} as GroupedArguments);
}
