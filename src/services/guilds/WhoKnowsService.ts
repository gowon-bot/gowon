import { toInt } from "../../helpers/lastFM";
import { BaseService } from "../BaseService";
import { MirrorballService } from "../mirrorball/MirrorballService";
import { RedisService } from "../redis/RedisService";

export class WhoKnowsService extends BaseService {
  redis = new RedisService(this.logger, { prefix: "whoknows" });
  mirrorballService = new MirrorballService(this.logger);

  async recordUnknownMember(guildID: string, userID: string) {
    this.log(`Handling unknown use ${userID} in ${guildID}`);

    const existingTries = await this.redis.sessionGet(
      userID,
      guildID,
      this.retryKey()
    );

    if (existingTries && toInt(existingTries) === 2) {
      this.mirrorballService.quietRemoveUserFromGuild(userID, guildID);
      this.redis.sessionDelete(userID, guildID, this.retryKey());
    } else {
      const newTries = existingTries ? toInt(existingTries) + 1 : 1;

      await this.redis.sessionSet(userID, guildID, this.retryKey(), newTries);
    }
  }

  private retryKey(): string {
    return "nicknameretries";
  }
}
