import { bold } from "../../helpers/discord";
import { LastfmLinks } from "../../helpers/lastfm/LastfmLinks";
import { toInt } from "../../helpers/native/number";
import { GowonContext } from "../../lib/context/Context";
import { Emoji } from "../../lib/emoji/Emoji";
import { displayLink } from "../../lib/views/displays";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";
import { LilacPrivacy } from "../lilac/LilacAPIService.types";
import { LilacGuildsService } from "../lilac/LilacGuildsService";
import { PrivateUserDisplay } from "../lilac/LilacUsersService";
import { LilacUser } from "../lilac/converters/user";
import {
  MirrorballPrivacy,
  MirrorballUser,
} from "../mirrorball/MirrorballTypes";
import {
  RedisService,
  RedisServiceContextOptions,
} from "../redis/RedisService";
import { NicknameService, UnknownUserDisplay } from "./NicknameService";

export interface DisplayUserOptions {
  customProfileLink: string;
}

type WhoKnowsServiceContext = GowonContext<{
  constants?: { redisOptions?: RedisServiceContextOptions };
}>;

export class WhoKnowsService extends BaseService<WhoKnowsServiceContext> {
  get redis() {
    return ServiceRegistry.get(RedisService);
  }
  get lilacGuildsService() {
    return ServiceRegistry.get(LilacGuildsService);
  }
  private get nicknameService() {
    return ServiceRegistry.get(NicknameService);
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
      this.lilacGuildsService.removeUser(ctx, userID, guildID);
      this.redis.sessionDelete(this.ctx(ctx), this.retryKey());
    } else {
      const newTries = existingTries ? toInt(existingTries) + 1 : 1;

      await this.redis.sessionSet(this.ctx(ctx), this.retryKey(), newTries);
    }
  }

  displayUser(
    ctx: GowonContext,
    user: MirrorballUser | LilacUser,
    options?: Partial<DisplayUserOptions>
  ): string {
    let nickname = this.nicknameService.cacheGetNickname(ctx, user.discordID);

    const profileLink =
      options?.customProfileLink || LastfmLinks.userPage(user.username);

    if (nickname) {
      if (nickname === UnknownUserDisplay) {
        this.recordUnknownMember(ctx, user.discordID);

        return nickname;
      }

      const display = displayLink(nickname, profileLink);

      return user.discordID === ctx.author.id ? bold(display) : display;
    }

    switch (user.privacy) {
      case MirrorballPrivacy.Discord:
      case LilacPrivacy.Discord:
        return (
          this.nicknameService.cacheGetUsername(ctx, user.discordID) ||
          UnknownUserDisplay
        );

      case MirrorballPrivacy.FMUsername:
      case LilacPrivacy.FMUsername:
        return Emoji.lastfm + " " + displayLink(user.username, profileLink);
      case MirrorballPrivacy.Both:
      case LilacPrivacy.Both:
        return displayLink(
          this.nicknameService.cacheGetUsername(ctx, user.discordID) ||
            UnknownUserDisplay,
          profileLink
        );

      case MirrorballPrivacy.Private:
      case MirrorballPrivacy.Unset:
      case LilacPrivacy.Private:
      case LilacPrivacy.Unset:
        return PrivateUserDisplay;
    }
  }

  private retryKey(): string {
    return "nicknameretries";
  }
}
