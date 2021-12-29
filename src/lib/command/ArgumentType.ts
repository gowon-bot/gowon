import { User } from "discord.js";
import { Arguments } from "../arguments/arguments";
import { CustomArgumentParser } from "../arguments/custom/custom";
import { Mention as CustomMention } from "../arguments/mentions/BaseMention";

type StringArrayConfig = {
  index: { start: number };
  join: false;
};

type NumberConfig = { number: true };

type CustomConfig = {
  custom: ((messageString: string) => any) | CustomArgumentParser<any>;
};

type UnwrapCustom<T extends CustomConfig> =
  T["custom"] extends CustomArgumentParser<infer U>
    ? U
    : T["custom"] extends (...args: any) => infer V
    ? V
    : never;

export type Argument<T> = T extends CustomConfig
  ? UnwrapCustom<T>
  : T extends StringArrayConfig
  ? string[]
  : T extends NumberConfig
  ? number
  : string;

type CustomMentionArrayConfig = {
  index: { start: number };
  mention: CustomMention;
};

type MentionArrayConfig = {
  index: { start: number };
};

type CustomMentionConfig = {
  mention: CustomMention;
};

export type Mention<T> = T extends CustomMentionArrayConfig
  ? string[]
  : T extends MentionArrayConfig
  ? User[]
  : T extends CustomMentionConfig
  ? string
  : User;

export type ArgumentName<T extends Arguments> =
  | keyof T["inputs"]
  | keyof T["mentions"];

export type ParsedArguments<T extends Arguments> = {
  [K in keyof T["inputs"]]?: Argument<T["inputs"][K]>;
} & {
  [K in keyof T["mentions"]]?: Mention<T["mentions"][K]>;
} & {
  [K in keyof T["flags"]]: boolean;
};
