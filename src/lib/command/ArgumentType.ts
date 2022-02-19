import { User } from "discord.js";
import { CustomArgumentParser } from "../context/arguments/parsers/custom";
import { Mention as CustomMention } from "../context/arguments/mentionTypes/BaseMention";

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
