import { toInt } from "../../helpers/lastFM";
import { BaseService, BaseServiceContext } from "../BaseService";
import { MirrorballService } from "../mirrorball/MirrorballService";
import { RedisService } from "../redis/RedisService";
import { ServiceRegistry } from "../ServicesRegistry";

export class WhoKnowsService extends BaseService {
  get redis() {
    return ServiceRegistry.get(RedisService);
  }
  get mirrorballService() {
    return ServiceRegistry.get(MirrorballService);
  }

  customContext = {
    prefix: "whoknows",
  };

  async recordUnknownMember(
    ctx: BaseServiceContext,
    guildID: string,
    userID: string
  ) {
    this.log(ctx, `Handling unknown use ${userID} in ${guildID}`);

    const existingTries = await this.redis.sessionGet(
      this.ctx(ctx),
      userID,
      guildID,
      this.retryKey()
    );

    if (existingTries && toInt(existingTries) === 2) {
      this.mirrorballService.quietRemoveUserFromGuild(ctx, userID, guildID);
      this.redis.sessionDelete(this.ctx(ctx), userID, guildID, this.retryKey());
    } else {
      const newTries = existingTries ? toInt(existingTries) + 1 : 1;

      await this.redis.sessionSet(
        this.ctx(ctx),
        userID,
        guildID,
        this.retryKey(),
        newTries
      );
    }
  }

  private retryKey(): string {
    return "nicknameretries";
  }
}
