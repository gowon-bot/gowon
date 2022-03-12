import {
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  TextBasedChannel,
  User,
} from "discord.js";
import { UsersService } from "../../services/dbservices/UsersService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { StreamedTweet } from "../../services/Twitter/converters/StreamedTweet";
import { GowonClient } from "../GowonClient";

export type OriginalPayload = Message | CommandInteraction | StreamedTweet;

export class Payload<T extends OriginalPayload = OriginalPayload> {
  constructor(public source: T) {}

  private normalizedProperties: { author?: User } = {};

  // Converts non-discord payload sources to discord ones
  // By fetching author, guild, etc.
  async normalize(client: GowonClient) {
    if (this.isTweet()) {
      const user = await ServiceRegistry.get(UsersService).getUserByTwitterID(
        this.source.authorID
      );

      const discordUser = await client.client.users.fetch(user.discordID);

      this.normalizedProperties.author = discordUser;
    }
  }

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

  isDiscord(): this is Payload<Message | CommandInteraction> {
    return this.isMessage() || this.isInteraction();
  }

  isTweet(): this is Payload<StreamedTweet> {
    return this.source instanceof StreamedTweet;
  }
}
