import {
  DMChannel,
  FileOptions,
  MessageResolvable,
  NewsChannel,
  PartialDMChannel,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import { EmbedView } from "../../lib/ui/views/EmbedView";

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
  withEmbed: EmbedView;
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
