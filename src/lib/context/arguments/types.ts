import { SimpleMap } from "../../../helpers/types";
import { ArgumentReturnType, BaseArgument } from "./argumentTypes/BaseArgument";
import { Flag } from "./argumentTypes/Flag";
import { NumberArgument } from "./argumentTypes/NumberArgument";
import { StringArgument } from "./argumentTypes/StringArgument";
import { StringArrayArgument } from "./argumentTypes/StringArrayArgument";
import { AttachmentArgument } from "./argumentTypes/discord/AttachmentArgument";
import { ChannelArgument } from "./argumentTypes/discord/ChannelArgument";
import { DiscordRoleArgument } from "./argumentTypes/discord/DiscordRoleArgument";
import { EmojisArgument } from "./argumentTypes/discord/EmojisArgument";
import { DateArgument } from "./argumentTypes/timeAndDate/DateArgument";
import { DateRangeArgument } from "./argumentTypes/timeAndDate/DateRangeArgument";
import { TimePeriodArgument } from "./argumentTypes/timeAndDate/TimePeriodArgument";

export type ArgumentsMap = SimpleMap<BaseArgument<unknown>>;

export interface Slice {
  start: number;
  stop?: number;
}

export type ImplementedOptions<T extends Record<string, unknown>> =
  | StringArgument<T>
  | NumberArgument<T>
  | StringArrayArgument<T>
  | DateRangeArgument<T>
  | TimePeriodArgument<T>
  | EmojisArgument<T>
  | DateArgument<T>
  | ChannelArgument<T>
  | DiscordRoleArgument<T>
  | AttachmentArgument<T>;

export type UnwrapProvidedOptions<T extends BaseArgument<unknown>> =
  T extends ImplementedOptions<infer U> ? U : {};

type UnwrapArgument<T extends BaseArgument<unknown, any, any>> =
  T extends BaseArgument<infer U, any, any>
    ? T extends Flag<any>
      ? boolean
      : ArgumentReturnType<U, UnwrapProvidedOptions<T>>
    : never;

export type ParsedArguments<T extends ArgumentsMap> = {
  [K in keyof T]: UnwrapArgument<T[K]>;
};

export type ArgumentName<T extends ArgumentsMap> = keyof T;
