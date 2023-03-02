import {
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  TextBasedChannel,
  User,
} from "discord.js";
import { GowonClient } from "../GowonClient";

export type OriginalPayload = Message | CommandInteraction;

export class Payload<T extends OriginalPayload = OriginalPayload> {
  constructor(public source: T) {}

  private normalizedProperties: { author?: User } = {};

  // Converts non-discord payload sources to discord ones
  // By fetching author, guild, etc.
  async normalize(_client: GowonClient) {}

  get guild(): Guild | undefined {
    if (this.isInteraction() || this.isMessage()) {
      return this.source.guild ?? undefined;
    }

    return undefined;
  }

  get author(): User {
    if (this.isMessage()) return this.source.author;
    else if (this.isInteraction()) return this.source.user;
    else return this.normalizedProperties.author!;
  }

  get member(): GuildMember {
    if (this.isMessage()) return this.source.member!;
    else if (this.isInteraction()) return this.source.member as GuildMember;
    else return {} as GuildMember;
  }

  get channel(): TextBasedChannel {
    if (this.isMessage() || this.isInteraction()) return this.source.channel!;
    return {} as TextBasedChannel;
  }

  isInteraction(): this is Payload<CommandInteraction> {
    return this.source instanceof CommandInteraction;
  }

  isMessage(): this is Payload<Message> {
    return this.source instanceof Message;
  }
}
