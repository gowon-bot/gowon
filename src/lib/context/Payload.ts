import {
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  TextBasedChannel,
  User,
} from "discord.js";

export type OriginalPayload = Message | CommandInteraction;

export class Payload<T extends OriginalPayload = OriginalPayload> {
  constructor(public source: T) {}

  get guild(): Guild {
    return this.source.guild!;
  }

  get author(): User {
    if (this.isMessage()) return this.source.author;
    else if (this.isInteraction()) return this.source.user;
    // Typescript doesn't realize that it's an interaction if it's not a message
    else return {} as User;
  }

  get member(): GuildMember {
    if (this.isMessage()) return this.source.member!;
    else return this.source.member as GuildMember;
  }

  get channel(): TextBasedChannel {
    return this.source.channel!;
  }

  isInteraction(): this is Payload<CommandInteraction> {
    return this.source instanceof CommandInteraction;
  }

  isMessage(): this is Payload<Message> {
    return this.source instanceof Message;
  }
}
