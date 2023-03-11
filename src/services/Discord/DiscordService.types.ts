import {
  DMChannel,
  FileOptions,
  MessageEmbed,
  MessageResolvable,
  NewsChannel,
  PartialDMChannel,
  TextChannel,
  ThreadChannel,
} from "discord.js";

export type RespondableChannel =
  | DMChannel
  | TextChannel
  | PartialDMChannel
  | ThreadChannel
  | NewsChannel;

export type ReplyOptions = Partial<{
  to: MessageResolvable;
  ping: boolean;
  noUppercase: boolean;
}>;

export interface SendOptions {
  inChannel: RespondableChannel;
  withEmbed: MessageEmbed;
  reply: boolean | ReplyOptions;
  files: string[] | FileOptions[];
  forceNoInteractionReply?: boolean;
  ephemeral?: boolean;
}

export function isPartialDMChannel(
  channel: RespondableChannel
): channel is PartialDMChannel {
  return channel.partial;
}
