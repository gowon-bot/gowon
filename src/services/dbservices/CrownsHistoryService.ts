import { User as DiscordUser, GuildMember } from "discord.js";
import { In } from "typeorm";
import { Crown } from "../../database/entity/Crown";
import { User } from "../../database/entity/User";
import { CrownEvent, SimpleCrown } from "../../database/entity/meta/CrownEvent";
import { SimpleMap } from "../../helpers/types";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";
import { CrownCheck, CrownState, CrownsService } from "./CrownsService";

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

type CrownsHistoryServiceContext = GowonContext;

export class CrownsHistoryService extends BaseService<CrownsHistoryServiceContext> {
  private get crownsService() {
    return ServiceRegistry.get(CrownsService);
  }

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
    ctx: CrownsHistoryServiceContext,
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

  async optOut(
    ctx: CrownsHistoryServiceContext,
    user: User,
    discordUser: GuildMember
  ) {
    const crowns = await this.crownsService.listTopCrowns(ctx, user.id, -1);

    this.logEvent(ctx, crowns, CrownEventString.userOptedOut, discordUser.user);
  }

  async handleCheck(ctx: CrownsHistoryServiceContext, crownCheck: CrownCheck) {
    let { state, crown, oldCrown } = crownCheck;
    let owner = await User.toDiscordUser(
      ctx.guild!,
      crownCheck.oldCrown!.user.discordID
    );

    switch (state) {
      case CrownState.updated:
        this.update(ctx, crown!, ctx.author, oldCrown!);
        break;

      case CrownState.newCrown:
        this.create(ctx, crown!, ctx.author);
        break;

      case CrownState.snatched:
        this.snatch(
          ctx,
          crown!,
          oldCrown!,
          SnatchedEventString.morePlays,
          ctx.author,
          owner
        );
        break;

      case CrownState.banned:
        this.snatch(
          ctx,
          crown!,
          oldCrown!,
          SnatchedEventString.userBanned,
          ctx.author,
          owner
        );
        break;

      case CrownState.inactivity:
        this.snatch(
          ctx,
          crown!,
          oldCrown!,
          SnatchedEventString.userInactive,
          ctx.author,
          owner
        );
        break;

      case CrownState.purgatory:
        this.snatch(
          ctx,
          crown!,
          oldCrown!,
          SnatchedEventString.userInPurgatory,
          ctx.author,
          owner
        );
        break;

      case CrownState.left:
        this.snatch(
          ctx,
          crown!,
          oldCrown!,
          SnatchedEventString.userLeft,
          ctx.author
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
    const findOptions: SimpleMap = { crown: { id: crown.id } };

    if (eventTypes) findOptions.event = In(eventTypes);

    return await CrownEvent.find({
      where: findOptions,
      order: { happenedAt: "DESC" },
    });
  }
}
