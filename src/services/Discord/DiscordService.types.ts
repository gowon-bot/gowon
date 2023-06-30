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
import { SendableComponent, SendableModal } from "../../lib/views/base";

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

export type SendableContentType =
  | string
  | EmbedBuilder
  | SendableComponent
  | SendableModal;

export class Sendable<
  ContentType extends SendableContentType = SendableContentType
> {
  constructor(public content: ContentType) {}

  public isString(): this is Sendable<string> {
    return typeof this.content === "string";
  }

  public isComponent(): this is Sendable<SendableComponent> {
    return this.content instanceof SendableComponent;
  }

  public isModal(): this is Sendable<SendableModal> {
    return this.content instanceof SendableModal;
  }

  public isEmbed(): this is Sendable<EmbedBuilder> {
    return this.content instanceof EmbedBuilder;
  }

  public getLogDisplay(): string {
    return this.isString()
      ? "string"
      : this.isComponent()
      ? "component"
      : this.isModal()
      ? "modal"
      : "embed";
  }
}
