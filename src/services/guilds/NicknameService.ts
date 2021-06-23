import { GowonClient } from "../../lib/GowonClient";
import { BaseService } from "../BaseService";
import { RedisService } from "../redis/RedisService";

export class NicknameService extends BaseService {
  redisService = new RedisService(this.logger, {
    defaultExpiry: 30 * 24 * 60 * 60,
  });

  private cache: { [discordID: string]: string } = {};

  async cacheNicknames(
    users: { discordID: string }[],
    guildID: string,
    gowonClient: GowonClient
  ) {
    (
      await Promise.all(
        users.map(async (u) => ({
          discordID: u.discordID,
          nickname: await this.getUsername(u.discordID, guildID, gowonClient),
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
  ) {
    let nickname = await this.redisService.sessionGet(
      discordID,
      guildID,
      "nickname"
    );

    if (!nickname || nickname === "<Unknown user>") {
      this.log(`Fetching nickname for ${discordID} in ${guildID}`);
      const user = await gowonClient.client.guilds
        .resolve(guildID)
        ?.members.fetch(discordID);

      nickname = user?.nickname || user?.user.username || "<Unknown user>";

      this.recordNickname(discordID, guildID, nickname);
    }

    return nickname;
  }
}
