import { SimpleMap } from "../../../helpers/types";
import { BaseArgument } from "./argumentTypes/BaseArgument";

export type ArgumentsMap = SimpleMap<BaseArgument<any>>;

export interface Slice {
  start: number;
  stop?: number;
}

type UnwrapArgument<T extends BaseArgument<any, any>> = T extends BaseArgument<
  infer U,
  any
>
  ? U
  : never;

export type ParsedArguments<T extends ArgumentsMap> = {
  [K in keyof T]: UnwrapArgument<T[K]>;
};

export type ArgumentName<T extends ArgumentsMap> = keyof T;

// export type ParsedArgument = any;

// export interface InputArguments {
//   index?: number | Slice;
//   default?: any;
//   join?: boolean;
//   splitOn?: string;
//   regex?: RegExp;
//   optional?: boolean;
//   custom?:
//     | ((messageString: string) => ParsedArgument)
//     | CustomArgumentParser<any>;
//   number?: boolean;
//   preprocessor?: (messageString: string) => string;
// }

// export interface Arguments {
//   mentions?: {
//     [name: string]: MentionOptions;
//   };
//   inputs?: {
//     [name: string]: InputArguments;
//   };
//   flags?: {
//     [name: string]: Flag;
//   };
// }

// export interface ParsedArguments {
//   [name: string]: ParsedArgument;
// }

// export class ArgumentParser extends Parser {
//   parsedArguments: ParsedArguments = {};
//   gowonService = ServiceRegistry.get(GowonService);
//   mentionParser = new MentionParser(this);
//   flagParser = new FlagParser();

//   constructor(public args: Arguments) {
//     super();
//   }

//   parse(message: Message, runAs: RunAs): ParsedArguments {
//     const messageString = this.removeAllMentions(message.content).trim();

//     const mentions = this.mentionParser.parse(message);

//     const { flags, string: stringWithNoFlags } =
//       this.flagParser.parseAndRemoveFlags(messageString, this.args.flags);

//     const inputs = this.parseInputs(
//       this.gowonService.removeCommandName(
//         stringWithNoFlags,
//         runAs,
//         message.guild!.id
//       )
//     );

//     this.parsedArguments = { ...mentions, ...inputs, ...flags };

//     return this.parsedArguments;
//   }

//   removeAllMentions(string: string): string {
//     if (this.mentionParser.hasNonDiscordMentions()) {
//       return this.mentionParser.removeCustomMentions(
//         this.removeMentions(string)
//       );
//     } else {
//       return this.removeMentions(string);
//     }
//   }

//   private parseInputs(string: string): ParsedArguments {
//     const genericArgs = this.parseInputsWithSplit(
//       string,
//       (string) => string.trim().split(/\s+/),
//       (arg) => !arg.splitOn
//     );

//     const splitOnArgs = this.parseInputsWithSplit(
//       string,
//       (string, arg) =>
//         (string + " ").split(
//           new RegExp(`\s*${escapeStringRegexp(arg?.splitOn || "")}\s*`)
//         ),
//       (arg) => !!arg.splitOn
//     );

//     const regexArgs = this.parseInputsWithSplit(
//       string,
//       (string, arg) => (string.match(arg.regex!) || []) as Array<string>,
//       (arg) => !!arg.regex
//     );

//     const customArgs = this.parseCustomInputs(string);

//     return { ...genericArgs, ...splitOnArgs, ...regexArgs, ...customArgs };
//   }

//   private parseInputsWithSplit(
//     messageString: string,
//     splitFunction: (string: string, arg: InputArguments) => Array<string>,
//     filter: (arg: InputArguments) => boolean
//   ): ParsedArguments {
//     if (this.args.inputs) {
//       const argArray = Object.keys(this.args.inputs).filter((arg) =>
//         filter(this.args.inputs![arg])
//       );

//       return argArray.reduce((acc: ParsedArguments, arg) => {
//         const argOptions = this.args.inputs![arg];

//         const string = argOptions.preprocessor
//           ? argOptions.preprocessor(messageString)
//           : messageString;

//         const array = splitFunction(string, argOptions);

//         acc[arg] = this.getElementFromIndex(
//           array,
//           argOptions.index || 0,
//           argOptions
//         );

//         return acc;
//       }, {} as ParsedArguments);
//     } else return {};
//   }

//   private parseCustomInputs(messageString: string): ParsedArguments {
//     if (this.args.inputs) {
//       const parsedArguments = Object.keys(this.args.inputs!)
//         .filter((arg) => !!this.args.inputs![arg].custom)
//         .reduce((acc, arg) => {
//           const argOptions = this.args.inputs![arg];

//           const string = argOptions.preprocessor
//             ? argOptions.preprocessor(messageString)
//             : messageString;

//           if (argOptions.custom) {
//             acc[arg] = isCustomParser(argOptions.custom)
//               ? argOptions.custom.parse(string)
//               : argOptions.custom(string);
//           }
//           return acc;
//         }, {} as ParsedArguments);

//       return parsedArguments;
//     } else return {};
//   }
// }

// export interface GroupedArguments {
//   [split: string]: { name: string; index: number | Slice; optional: boolean }[];
// }
// export function groupArgumentsBySplit(args: Arguments): GroupedArguments {
//   return Object.keys(args.inputs ?? {}).reduce((acc, argName) => {
//     let arg = args.inputs![argName];

//     if (!acc[arg.splitOn ?? " "]) acc[arg.splitOn ?? " "] = [];

//     if (arg.splitOn) {
//       acc[arg.splitOn].push({
//         name: argName,
//         index: arg.index || 0,
//         optional: arg.optional ?? false,
//       });
//     } else {
//       acc[" "].push({
//         name: argName,
//         index: arg.index || 0,
//         optional: arg.optional ?? false,
//       });
//     }

//     return acc;
//   }, {} as GroupedArguments);
// }
