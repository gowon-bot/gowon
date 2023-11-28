import { AnyChannel, DiscordAPIError, GuildMember, User } from "discord.js";
import { GowonContext } from "../../lib/context/Context";
import { DiscordResponseService } from "./DiscordResponseService";
import { DiscordID } from "./DiscordService.types";

export type DiscordServiceContext = GowonContext<{
  mutable?: {
    replied?: boolean;
    deferredAt?: Date;
    deferredResponseTimeout?: NodeJS.Timeout;
  };
}>;

export class DiscordService extends DiscordResponseService {
  public async getDiscordUserFromUsername(
    ctx: GowonContext,
    username: string
  ): Promise<User | undefined> {
    const members = await ctx.requiredGuild.members.fetch();

    const member = members.find(
      (m) =>
        m.user.username.toLowerCase() === username.toLowerCase() ||
        m.nickname?.toLowerCase() === username.toLowerCase()
    );

    return member?.user;
  }

  public async fetchGuildMember(
    ctx: GowonContext,
    userID: DiscordID
  ): Promise<GuildMember | undefined> {
    try {
      return await ctx.guild?.members.fetch(userID);
    } catch (e) {
      if (!(e instanceof DiscordAPIError)) throw e;
      return undefined;
    }
  }

  public async fetchUser(
    ctx: GowonContext,
    userID: DiscordID
  ): Promise<User | undefined> {
    if (ctx.author.id === userID) return ctx.author;

    try {
      return await ctx.client.client.users.fetch(userID);
    } catch (e) {
      if (!(e instanceof DiscordAPIError)) throw e;
      return undefined;
    }
  }

  public async fetchChannel(
    ctx: GowonContext,
    channelID: DiscordID
  ): Promise<AnyChannel | undefined> {
    if (ctx.payload.channel.id === channelID) return ctx.payload.channel;

    try {
      return (await ctx.client.client.channels.fetch(channelID)) ?? undefined;
    } catch (e) {
      if (!(e instanceof DiscordAPIError)) throw e;
      return undefined;
    }
  }

  public async userInServer(
    ctx: GowonContext,
    userID: DiscordID
  ): Promise<boolean> {
    return !!(await this.fetchGuildMember(ctx, userID));
  }
}
