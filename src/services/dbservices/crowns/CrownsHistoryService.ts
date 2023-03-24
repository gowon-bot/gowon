import { User as DiscordUser, GuildMember } from "discord.js";
import { In } from "typeorm";
import { Crown } from "../../../database/entity/Crown";
import { User } from "../../../database/entity/User";
import {
  CrownEvent,
  SimpleCrown,
} from "../../../database/entity/meta/CrownEvent";
import { SimpleMap } from "../../../helpers/types";
import { GowonContext } from "../../../lib/context/Context";
import { BaseService } from "../../BaseService";
import { ServiceRegistry } from "../../ServicesRegistry";
import { CrownCheck, PreviousCrownData, Updated } from "./CrownCheck";
import { CrownsService } from "./CrownsService";
import { CrownState } from "./CrownsService.types";

export enum CrownEventString {
  created = "created",
  snatched = "snatched",
  killed = "killed",
  updated = "updated",
  userBanned = "user.banned",
  userUnbanned = "user.unbanned",
  userOptedOut = "user.optedOut",
}

export enum SnatchedEventString {
  morePlays = "morePlays",
  userBanned = "user.banned",
  userInPurgatory = "user.purgatory",
  userInactive = "user.inactive",
  userLeft = "user.left",
}

type LogEventOptions = {
  reason?: SnatchedEventString;
  secondaryUser?: DiscordUser;
  previousCrown?: PreviousCrownData;
  oldCrown?: Crown;
  newCrown?: SimpleCrown;
};

export class CrownsHistoryService extends BaseService {
  private get crownsService() {
    return ServiceRegistry.get(CrownsService);
  }

  private async logEvent(
    ctx: GowonContext,
    crown: Crown | Crown[],
    event: CrownEventString,
    perpetuator: DiscordUser,
    options: LogEventOptions = {}
  ) {
    if (crown instanceof Array) {
      for (const c of crown) {
        this.logEvent(ctx, c, event, perpetuator, options);
      }
    } else {
      this.log(
        ctx,
        `Logging crown event: ${event} for crown ${crown.artistName} in ${crown.serverID}`
      );

      const history = CrownEvent.create({
        crown,
        event,
        perpetuatorDiscordID: perpetuator.id,
        perpetuatorUsername: perpetuator.username,
        newCrown: options.newCrown || {
          artistName: crown.artistName,
          plays: crown.plays,
        },
      });

      if (options.previousCrown || options.oldCrown) {
        history.oldCrown = {
          artistName: options.oldCrown?.artistName || crown.artistName,
          plays: (options.oldCrown?.plays || options.previousCrown?.plays)!,
        };
      }

      if (options.secondaryUser) {
        history.secondaryUserDiscordID = options.secondaryUser.id;
        history.secondaryUsername = options.secondaryUser.username;
      }

      if (options.reason) history.snatchedEvent = options.reason;

      await history.save();
    }
  }

  create(ctx: GowonContext, crown: Crown, creator: DiscordUser) {
    this.logEvent(ctx, crown, CrownEventString.created, creator);
  }

  snatch(
    ctx: GowonContext,
    crown: Crown,
    previousCrown: PreviousCrownData,
    reason: SnatchedEventString,
    snatcher: DiscordUser,
    snatchee?: DiscordUser
  ) {
    this.logEvent(ctx, crown, CrownEventString.snatched, snatcher, {
      reason,
      secondaryUser: snatchee,
      previousCrown,
    });
  }

  kill(ctx: GowonContext, crown: Crown, killer: DiscordUser) {
    this.logEvent(ctx, crown, CrownEventString.killed, killer);
  }

  update(
    ctx: GowonContext,
    crown: Crown,
    updater: DiscordUser,
    previousCrown: PreviousCrownData
  ) {
    this.logEvent(ctx, crown, CrownEventString.updated, updater, {
      previousCrown,
    });
  }

  async ban(
    ctx: GowonContext,
    user: User,
    banner: DiscordUser,
    banTarget: DiscordUser
  ) {
    const crowns = await this.crownsService.listTopCrowns(
      ctx,
      user.id,
      undefined
    );

    this.logEvent(ctx, crowns, CrownEventString.userBanned, banner, {
      secondaryUser: banTarget,
    });
  }

  async unban(
    ctx: GowonContext,
    user: User,
    unbanner: DiscordUser,
    unbanTarget: DiscordUser
  ) {
    const crowns = await this.crownsService.listTopCrowns(
      ctx,
      user.id,
      undefined
    );

    this.logEvent(ctx, crowns, CrownEventString.userUnbanned, unbanner, {
      secondaryUser: unbanTarget,
    });
  }

  async optOut(ctx: GowonContext, user: User, discordUser: GuildMember) {
    const crowns = await this.crownsService.listTopCrowns(ctx, user.id, -1);

    this.logEvent(ctx, crowns, CrownEventString.userOptedOut, discordUser.user);
  }

  async handleCheck(ctx: GowonContext, crownCheck: CrownCheck) {
    const { crown, previousCrown } = crownCheck.getOptions();

    const owner = await User.toDiscordUser(
      ctx.requiredGuild,
      previousCrown.ownerDiscordID
    );

    switch (crownCheck.state) {
      case Updated.name:
        this.update(ctx, crown, ctx.author, previousCrown);
        break;

      case CrownState.newCrown:
        this.create(ctx, crown, ctx.author);
        break;

      case CrownState.snatched:
        this.snatch(
          ctx,
          crown!,
          previousCrown,
          SnatchedEventString.morePlays,
          ctx.author,
          owner
        );
        break;

      case CrownState.banned:
        this.snatch(
          ctx,
          crown,
          previousCrown,
          SnatchedEventString.userBanned,
          ctx.author,
          owner
        );
        break;

      case CrownState.inactivity:
        this.snatch(
          ctx,
          crown,
          previousCrown,
          SnatchedEventString.userInactive,
          ctx.author,
          owner
        );
        break;

      case CrownState.purgatory:
        this.snatch(
          ctx,
          crown,
          previousCrown,
          SnatchedEventString.userInPurgatory,
          ctx.author,
          owner
        );
        break;

      case CrownState.left:
        this.snatch(
          ctx,
          crown!,
          previousCrown,
          SnatchedEventString.userLeft,
          ctx.author
        );
        break;

      default:
        break;
    }
  }

  async getHistory(
    ctx: GowonContext,
    crown: Crown,
    eventTypes?: CrownEventString[]
  ): Promise<CrownEvent[]> {
    this.log(
      ctx,
      `Fetching history for ${crown.artistName} in ${crown.serverID}`
    );
    const findOptions: SimpleMap = { crown: { id: crown.id } };

    if (eventTypes) findOptions.event = In(eventTypes);

    return await CrownEvent.find({
      where: findOptions,
      order: { happenedAt: "DESC" },
    });
  }
}
