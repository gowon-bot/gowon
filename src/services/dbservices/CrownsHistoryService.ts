import { Crown } from "../../database/entity/Crown";
import { CrownEvent, SimpleCrown } from "../../database/entity/meta/CrownEvent";
import { User } from "../../database/entity/User";
import { BaseService, BaseServiceContext } from "../BaseService";
import { CrownCheck, CrownsService, CrownState } from "./CrownsService";
import { GuildMember, Message, User as DiscordUser } from "discord.js";
import { FindConditions, In } from "typeorm";

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

type CrownsHistoryServiceContext = BaseServiceContext & {
  crownsService: CrownsService;
};

export class CrownsHistoryService extends BaseService<CrownsHistoryServiceContext> {
  private async logEvent(
    ctx: CrownsHistoryServiceContext,
    crown: Crown | Crown[],
    event: CrownEventString,
    perpetuator: DiscordUser,
    options: {
      reason?: SnatchedEventString;
      secondaryUser?: DiscordUser;
      oldCrown?: Crown;
      newCrown?: SimpleCrown;
    } = {}
  ) {
    if (crown instanceof Array) {
      for (let _crown of crown) {
        this.logEvent(ctx, _crown, event, perpetuator, options);
      }
    } else {
      this.log(
        ctx,
        `Logging crown event: ${event} for crown ${crown.artistName} in ${crown.serverID}`
      );

      let history = CrownEvent.create({
        crown,
        event,
        perpetuatorDiscordID: perpetuator.id,
        perpetuatorUsername: perpetuator.username,
        newCrown: options.newCrown || {
          artistName: crown.artistName,
          plays: crown.plays,
        },
      });

      if (options.oldCrown)
        history.oldCrown = {
          artistName: options.oldCrown.artistName,
          plays: options.oldCrown.plays,
        };

      if (options.secondaryUser) {
        history.secondaryUserDiscordID = options.secondaryUser.id;
        history.secondaryUsername = options.secondaryUser.username;
      }

      if (options.reason) history.snatchedEvent = options.reason;

      await history.save();
    }
  }

  create(ctx: CrownsHistoryServiceContext, crown: Crown, creator: DiscordUser) {
    this.logEvent(ctx, crown, CrownEventString.created, creator);
  }

  snatch(
    ctx: CrownsHistoryServiceContext,
    crown: Crown,
    oldCrown: Crown,
    reason: SnatchedEventString,
    snatcher: DiscordUser,
    snatchee?: DiscordUser
  ) {
    this.logEvent(ctx, crown, CrownEventString.snatched, snatcher, {
      reason,
      secondaryUser: snatchee,
      oldCrown,
    });
  }

  kill(ctx: CrownsHistoryServiceContext, crown: Crown, killer: DiscordUser) {
    this.logEvent(ctx, crown, CrownEventString.killed, killer);
  }

  update(
    ctx: CrownsHistoryServiceContext,
    crown: Crown,
    updater: DiscordUser,
    oldCrown: Crown
  ) {
    this.logEvent(ctx, crown, CrownEventString.updated, updater, {
      oldCrown,
    });
  }

  async ban(
    ctx: CrownsHistoryServiceContext,
    user: User,
    banner: DiscordUser,
    banTarget: DiscordUser
  ) {
    let crowns = await ctx.crownsService.listTopCrowns(
      ctx,
      user.discordID,
      undefined
    );

    this.logEvent(ctx, crowns, CrownEventString.userBanned, banner, {
      secondaryUser: banTarget,
    });
  }

  async unban(
    ctx: CrownsHistoryServiceContext,
    user: User,
    unbanner: DiscordUser,
    unbanTarget: DiscordUser
  ) {
    let crowns = await ctx.crownsService.listTopCrowns(
      ctx,
      user.discordID,
      undefined
    );

    this.logEvent(ctx, crowns, CrownEventString.userUnbanned, unbanner, {
      secondaryUser: unbanTarget,
    });
  }

  async optOut(ctx: CrownsHistoryServiceContext, discordUser: GuildMember) {
    let crowns = await ctx.crownsService.listTopCrowns(
      ctx,
      discordUser.user.id,
      -1
    );

    this.logEvent(ctx, crowns, CrownEventString.userOptedOut, discordUser.user);
  }

  async handleCheck(
    ctx: CrownsHistoryServiceContext,
    crownCheck: CrownCheck,
    message: Message
  ) {
    let { state, crown, oldCrown } = crownCheck;
    let owner = await User.toDiscordUser(
      message.guild!,
      crownCheck.oldCrown!.user.discordID
    );

    switch (state) {
      case CrownState.updated:
        this.update(ctx, crown!, message.author, oldCrown!);
        break;

      case CrownState.newCrown:
        this.create(ctx, crown!, message.author);
        break;

      case CrownState.snatched:
        this.snatch(
          ctx,
          crown!,
          oldCrown!,
          SnatchedEventString.morePlays,
          message.author,
          owner
        );
        break;

      case CrownState.banned:
        this.snatch(
          ctx,
          crown!,
          oldCrown!,
          SnatchedEventString.userBanned,
          message.author,
          owner
        );
        break;

      case CrownState.inactivity:
        this.snatch(
          ctx,
          crown!,
          oldCrown!,
          SnatchedEventString.userInactive,
          message.author,
          owner
        );
        break;

      case CrownState.purgatory:
        this.snatch(
          ctx,
          crown!,
          oldCrown!,
          SnatchedEventString.userInPurgatory,
          message.author,
          owner
        );
        break;

      case CrownState.left:
        this.snatch(
          ctx,
          crown!,
          oldCrown!,
          SnatchedEventString.userLeft,
          message.author
        );
        break;

      default:
        break;
    }
  }

  async getHistory(
    ctx: CrownsHistoryServiceContext,
    crown: Crown,
    eventTypes?: CrownEventString[]
  ): Promise<CrownEvent[]> {
    this.log(
      ctx,
      `Fetching history for ${crown.artistName} in ${crown.serverID}`
    );
    let findOptions: FindConditions<CrownEvent> = { crown };

    if (eventTypes) findOptions.event = In(eventTypes);

    return await CrownEvent.find({
      where: findOptions,
      order: { happenedAt: "DESC" },
    });
  }
}
