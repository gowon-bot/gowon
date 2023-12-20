import { asyncMap } from "../../helpers";
import { SimpleMap } from "../../helpers/types";
import { GowonContext } from "../../lib/context/Context";
import { displayNumber, displayUserTag } from "../../lib/ui/displays";
import { BaseService } from "../BaseService";
import {
  RedisService,
  RedisServiceContextOptions,
} from "../redis/RedisService";
import { ServiceRegistry } from "../ServicesRegistry";

export const UnknownUserDisplay = "<Unknown user>";

export type NicknameServiceContext = GowonContext<{
  constants?: { redisOptions?: RedisServiceContextOptions };
  mutable?: {
    nicknameCache?: { [discordID: string]: string };
    usernameCache?: { [discordID: string]: string };
  };
}>;

export class NicknameService extends BaseService<NicknameServiceContext> {
  get redisService() {
    return ServiceRegistry.get(RedisService);
  }

  customContext = {
    constants: { redisOptions: { defaultExpirySeconds: 30 * 24 * 60 * 60 } },
  };

  async cacheNicknames(
    ctx: NicknameServiceContext,
    users: Array<{ discordID: string } | string>
  ) {
    const guildID = ctx.requiredGuild.id;

    this.log(
      this.ctx(ctx),
      `Caching nicknames for ${displayNumber(
        users.length,
        "user"
      )} in ${guildID}`
    );

    const discordIDs: string[] =
      typeof users[0] === "string" ? users : users.map((u: any) => u.discordID);

    (
      await asyncMap(discordIDs, async (u) => ({
        discordID: u,
        info: await this.getNickname(ctx, u),
      }))
    ).forEach((u) => {
      if (u.info.nickname)
        this.nicknameCache(ctx)[u.discordID] = u.info.nickname;
      if (u.info.username)
        this.usernameCache(ctx)[u.discordID] = u.info.username;
    });
  }

  async cacheUsernames(
    ctx: NicknameServiceContext,
    users: Array<{ discordID: string } | string>
  ) {
    this.log(
      ctx,
      `Caching usernames for ${displayNumber(users.length, "user")}`
    );

    const discordIDs: string[] =
      typeof users[0] === "string" ? users : users.map((u: any) => u.discordID);

    (
      await asyncMap(discordIDs, async (u) => ({
        discordID: u,
        username: await this.getUsername(ctx, u),
      }))
    ).forEach((u) => {
      this.usernameCache(ctx)[u.discordID] = u.username;
    });
  }

  cacheGetNickname(ctx: NicknameServiceContext, discordID: string): string {
    return this.nicknameCache(ctx)[discordID];
  }

  cacheGetUsername(ctx: NicknameServiceContext, discordID: string): string {
    return this.usernameCache(ctx)[discordID];
  }

  async recordNickname(
    ctx: NicknameServiceContext,
    discordID: string,
    nickname: string
  ) {
    const guildID = ctx.guild?.id;

    if (!guildID) return;

    await this.redisService.set(
      this.ctx(ctx),
      this.generateNicknameKey(discordID, guildID),
      nickname
    );
  }

  async recordUsername(
    ctx: NicknameServiceContext,
    discordID: string,
    username: string
  ) {
    await this.redisService.set(
      this.ctx(ctx),
      this.generateUsernameKey(discordID),
      username
    );
  }

  async getNickname(
    ctx: NicknameServiceContext,
    discordID: string
  ): Promise<{ nickname?: string; username?: string }> {
    const guildID = ctx.requiredGuild.id;

    let nickname = await this.redisService.get(
      this.ctx(ctx),
      this.generateNicknameKey(discordID, guildID)
    );
    let username: string | undefined;

    if (!nickname || nickname === "<Unknown user>") {
      this.log(ctx, `Fetching nickname for ${discordID} in ${guildID}`);

      try {
        const user = await ctx.client.client.guilds
          .resolve(guildID)
          ?.members.fetch(discordID);

        nickname = user?.nickname || user?.user.username || UnknownUserDisplay;
        username = user?.user.username;

        this.recordNickname(this.ctx(ctx), discordID, nickname);
      } catch (e) {}
    }

    return { nickname, username };
  }

  async getUsername(
    ctx: NicknameServiceContext,
    discordID: string
  ): Promise<string> {
    let username =
      this.cacheGetUsername(ctx, discordID) ||
      (await this.redisService.get(
        this.ctx(ctx),
        this.generateUsernameKey(discordID)
      ));

    if (!username || username === UnknownUserDisplay) {
      this.log(ctx, `Fetching username for ${discordID}`);
      try {
        const user = await ctx.client.client.users.fetch(discordID);

        username = user ? displayUserTag(user) : undefined;

        if (username) this.recordUsername(ctx, discordID, username);
        else username = UnknownUserDisplay;
      } catch {
        username = UnknownUserDisplay;
      }
    }

    return username;
  }

  protected generateUsernameKey(discordID: string) {
    return `${discordID}-username`;
  }

  protected generateNicknameKey(discordID: string, guildID: string) {
    return `${discordID}-${guildID}-nickname`;
  }

  private nicknameCache(ctx: NicknameServiceContext): SimpleMap<string> {
    if (!ctx.mutable.nicknameCache) ctx.mutable.nicknameCache = {};

    return ctx.mutable.nicknameCache;
  }

  private usernameCache(ctx: NicknameServiceContext): SimpleMap<string> {
    if (!ctx.mutable.usernameCache) ctx.mutable.usernameCache = {};

    return ctx.mutable.usernameCache;
  }
}
