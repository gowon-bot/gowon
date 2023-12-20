import {
  DMChannel,
  FileOptions,
  MessageResolvable,
  NewsChannel,
  PartialDMChannel,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import { EmbedComponent } from "../../lib/views/framework/EmbedComponent";

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
  withEmbed: EmbedComponent;
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

export type DiscordID = string;
