import { displayNumber } from "../../lib/views/displays";
import { BaseService, BaseServiceContext } from "../BaseService";
import { RedisService } from "../redis/RedisService";
import { ServiceRegistry } from "../ServicesRegistry";

export const UnknownUserDisplay = "<Unknown user>";

export class NicknameService extends BaseService {
  get redisService() {
    return ServiceRegistry.get(RedisService);
  }

  customContext = {
    defaultExpirySeconds: 30 * 24 * 60 * 60,
  };

  private nicknameCache: { [discordID: string]: string } = {};
  private usernameCache: { [discordID: string]: string } = {};

  async cacheNicknames(
    ctx: BaseServiceContext,
    users: Array<{ discordID: string } | string>
  ) {
    const guildID = this.guild(ctx).id;

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
      await Promise.all(
        discordIDs.map(async (u) => ({
          discordID: u,
          info: await this.getNickname(ctx, u),
        }))
      )
    ).forEach((u) => {
      if (u.info.nickname) this.nicknameCache[u.discordID] = u.info.nickname;
      if (u.info.username) this.usernameCache[u.discordID] = u.info.username;
    });
  }

  async cacheUsernames(
    ctx: BaseServiceContext,
    users: Array<{ discordID: string } | string>
  ) {
    this.log(
      ctx,
      `Caching usernames for ${displayNumber(users.length, "user")}`
    );

    const discordIDs: string[] =
      typeof users[0] === "string" ? users : users.map((u: any) => u.discordID);

    (
      await Promise.all(
        discordIDs.map(async (u) => ({
          discordID: u,
          username: await this.getUsername(ctx, u),
        }))
      )
    ).forEach((u) => {
      this.usernameCache[u.discordID] = u.username;
    });
  }

  cacheGetNickname(discordID: string): string {
    return this.nicknameCache[discordID];
  }

  cacheGetUsername(discordID: string): string {
    return this.usernameCache[discordID];
  }

  async recordNickname(
    ctx: BaseServiceContext,
    discordID: string,
    nickname: string
  ) {
    const guildID = this.guild(ctx)?.id;

    if (!guildID) return;

    await this.redisService.set(
      this.ctx(ctx),
      this.generateNicknameKey(discordID, guildID),
      nickname
    );
  }

  async recordUsername(
    ctx: BaseServiceContext,
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
    ctx: BaseServiceContext,
    discordID: string
  ): Promise<{ nickname?: string; username?: string }> {
    const guildID = this.guild(ctx).id;

    let nickname = await this.redisService.sessionGet(
      this.ctx(ctx),
      "nickname"
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
      } catch {}
    }

    return { nickname, username };
  }

  async getUsername(
    ctx: BaseServiceContext,
    discordID: string
  ): Promise<string> {
    let username =
      this.cacheGetUsername(discordID) ||
      (await this.redisService.get(
        this.ctx(ctx),
        this.generateUsernameKey(discordID)
      ));

    if (!username || username === UnknownUserDisplay) {
      this.log(ctx, `Fetching username for ${discordID}`);
      try {
        const user = await ctx.client.client.users.fetch(discordID);

        username = user ? user.username + "#" + user.discriminator : undefined;

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
    return `${discordID}-${guildID}-username`;
  }
}
