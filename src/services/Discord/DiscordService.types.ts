import {
  AttachmentBuilder,
  DMChannel,
  EmbedBuilder,
  MessageResolvable,
  NewsChannel,
  PartialDMChannel,
  StageChannel,
  TextChannel,
  ThreadChannel,
  VoiceChannel,
} from "discord.js";

export type RespondableChannel =
  | DMChannel
  | TextChannel
  | PartialDMChannel
  | ThreadChannel
  | NewsChannel
  | StageChannel
  | VoiceChannel;

export type ReplyOptions = Partial<{
  to: MessageResolvable;
  ping: boolean;
  noUppercase: boolean;
}>;

export interface SendOptions {
  inChannel: RespondableChannel;
  withEmbed: EmbedBuilder;
  reply: boolean | ReplyOptions;
  files: AttachmentBuilder[];
  forceNoInteractionReply?: boolean;
  ephemeral?: boolean;
}

export function isPartialDMChannel(
  channel: RespondableChannel
): channel is PartialDMChannel {
  return channel.partial;
}

export type DiscordID = string;
