import { GowonClient } from "../../lib/GowonClient";
import { displayNumber } from "../../lib/views/displays";
import { BaseService } from "../BaseService";
import { RedisService } from "../redis/RedisService";

export const UnknownUserDisplay = "<Unknown user>";

export class NicknameService extends BaseService {
  redisService = new RedisService(this.logger, {
    defaultExpirySeconds: 30 * 24 * 60 * 60,
  });

  private nicknameCache: { [discordID: string]: string } = {};
  private usernameCache: { [discordID: string]: string } = {};

  async cacheNicknames(
    users: Array<{ discordID: string } | string>,
    guildID: string,
    gowonClient: GowonClient
  ) {
    this.log(
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
          info: await this.getNickname(u, guildID, gowonClient),
        }))
      )
    ).forEach((u) => {
      if (u.info.nickname) this.nicknameCache[u.discordID] = u.info.nickname;
      if (u.info.username) this.usernameCache[u.discordID] = u.info.username;
    });
  }

  async cacheUsernames(
    users: Array<{ discordID: string } | string>,
    gowonClient: GowonClient
  ) {
    this.log(`Caching usernames for ${displayNumber(users.length, "user")}`);

    const discordIDs: string[] =
      typeof users[0] === "string" ? users : users.map((u: any) => u.discordID);

    (
      await Promise.all(
        discordIDs.map(async (u) => ({
          discordID: u,
          username: await this.getUsername(u, gowonClient),
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
    discordID: string,
    guildID: string | undefined,
    nickname: string
  ) {
    if (!guildID) return;

    await this.redisService.sessionSet(
      discordID,
      guildID,
      "nickname",
      nickname
    );
  }

  async recordUsername(discordID: string, username: string) {
    await this.redisService.set(this.generateUsernameKey(discordID), username);
  }

  async getNickname(
    discordID: string,
    guildID: string,
    gowonClient: GowonClient
  ): Promise<{ nickname?: string; username?: string }> {
    let nickname = await this.redisService.sessionGet(
      discordID,
      guildID,
      "nickname"
    );
    let username: string | undefined;

    if (!nickname || nickname === "<Unknown user>") {
      this.log(`Fetching nickname for ${discordID} in ${guildID}`);

      try {
        const user = await gowonClient.client.guilds
          .resolve(guildID)
          ?.members.fetch(discordID);

        nickname = user?.nickname || user?.user.username || UnknownUserDisplay;
        username = user?.user.username;

        this.recordNickname(discordID, guildID, nickname);
      } catch {}
    }

    return { nickname, username };
  }

  async getUsername(
    discordID: string,
    gowonClient: GowonClient
  ): Promise<string> {
    let username =
      this.cacheGetUsername(discordID) ||
      (await this.redisService.get(this.generateUsernameKey(discordID)));

    if (!username || username === UnknownUserDisplay) {
      this.log(`Fetching username for ${discordID}`);
      try {
        const user = await gowonClient.client.users.fetch(discordID);

        username = user ? user.username + "#" + user.discriminator : undefined;

        if (username) this.recordUsername(discordID, username);
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
}
