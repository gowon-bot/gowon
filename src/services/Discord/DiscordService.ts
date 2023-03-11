import { User } from "discord.js";
import { GowonContext } from "../../lib/context/Context";
import { DiscordResponseService } from "./DiscordResponseService";

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
}
