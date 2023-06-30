import { DiscordjsError, GuildMember, User } from "discord.js";
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
      if (!(e instanceof DiscordjsError)) throw e;
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
