import { User } from "discord.js";
import { Mention as CustomMention } from "../arguments/mentions/BaseMention";

type StringArrayConfig = {
  index: { start: number };
  join: false;
};

type NumberConfig = { number: true };

type CustomConfig = { custom: (...args: any) => any };

type UnwrapCustom<T extends CustomConfig> = T["custom"] extends (
  ...args: any
) => infer U
  ? U
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
