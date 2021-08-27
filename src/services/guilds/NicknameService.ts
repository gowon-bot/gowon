import { GowonClient } from "../../lib/GowonClient";
import { displayNumber } from "../../lib/views/displays";
import { BaseService } from "../BaseService";
import { RedisService } from "../redis/RedisService";

export const UnknownUserDisplay = "<Unknown user>";

export class NicknameService extends BaseService {
  redisService = new RedisService(this.logger, {
    defaultExpirySeconds: 30 * 24 * 60 * 60,
  });

  private cache: { [discordID: string]: string } = {};

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
          nickname: await this.getUsername(u, guildID, gowonClient),
        }))
      )
    ).forEach((u) => (this.cache[u.discordID] = u.nickname));
  }

  cacheGetNickname(discordID: string): string {
    return this.cache[discordID];
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

  async getUsername(
    discordID: string,
    guildID: string,
    gowonClient: GowonClient
  ): Promise<string> {
    let nickname = await this.redisService.sessionGet(
      discordID,
      guildID,
      "nickname"
    );

    if (!nickname) {
      try {
        this.log(`Fetching nickname for ${discordID} in ${guildID}`);
        const user = await gowonClient.client.guilds
          .resolve(guildID)
          ?.members.fetch(discordID);

        nickname = user?.nickname || user?.user.username;

        if (!nickname) {
          return UnknownUserDisplay;
        }

        this.recordNickname(discordID, guildID, nickname);
      } catch {
        return UnknownUserDisplay;
      }
    }

    return nickname;
  }
}
