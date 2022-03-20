import { toInt } from "../../helpers/lastFM";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { MirrorballUsersService } from "../mirrorball/services/MirrorballUsersService";
import {
  RedisService,
  RedisServiceContextOptions,
} from "../redis/RedisService";
import { ServiceRegistry } from "../ServicesRegistry";

type WhoKnowsServiceContext = GowonContext<{
  constants?: { redisOptions?: RedisServiceContextOptions };
}>;

export class WhoKnowsService extends BaseService<WhoKnowsServiceContext> {
  get redis() {
    return ServiceRegistry.get(RedisService);
  }
  get mirrorballUsersService() {
    return ServiceRegistry.get(MirrorballUsersService);
  }

  customContext = {
    constants: { redisOptions: { prefix: "whoknows" } },
  };

  async recordUnknownMember(ctx: WhoKnowsServiceContext, userID: string) {
    const guildID = ctx.requiredGuild.id;

    this.log(ctx, `Handling unknown use ${userID} in ${guildID}`);

    const existingTries = await this.redis.sessionGet(
      this.ctx(ctx),
      this.retryKey()
    );

    if (existingTries && toInt(existingTries) === 2) {
      this.mirrorballUsersService.quietRemoveUserFromGuild(
        ctx,
        userID,
        guildID
      );
      this.redis.sessionDelete(this.ctx(ctx), this.retryKey());
    } else {
      const newTries = existingTries ? toInt(existingTries) + 1 : 1;

      await this.redis.sessionSet(this.ctx(ctx), this.retryKey(), newTries);
    }
  }

  private retryKey(): string {
    return "nicknameretries";
  }
}
