import { Crown } from "../../database/entity/Crown";
import { CrownEvent, SimpleCrown } from "../../database/entity/meta/CrownEvent";
import { User } from "../../database/entity/User";
import { Logger } from "../../lib/Logger";
import { BaseService } from "../BaseService";
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

export class CrownsHistoryService extends BaseService {
  constructor(
    logger: Logger | undefined,
    private crownsService: CrownsService
  ) {
    super(logger);
  }

  private async logEvent(
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
        this.logEvent(_crown, event, perpetuator, options);
      }
    } else {
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

  create(crown: Crown, creator: DiscordUser) {
    this.logEvent(crown, CrownEventString.created, creator);
  }

  snatch(
    crown: Crown,
    oldCrown: Crown,
    reason: SnatchedEventString,
    snatcher: DiscordUser,
    snatchee?: DiscordUser
  ) {
    this.logEvent(crown, CrownEventString.snatched, snatcher, {
      reason,
      secondaryUser: snatchee,
      oldCrown,
    });
  }

  kill(crown: Crown, killer: DiscordUser) {
    this.logEvent(crown, CrownEventString.killed, killer);
  }

  update(crown: Crown, updater: DiscordUser, oldCrown: Crown) {
    this.logEvent(crown, CrownEventString.updated, updater, {
      oldCrown,
    });
  }

  async ban(user: User, banner: DiscordUser, banTarget: DiscordUser) {
    let crowns = await this.crownsService.listTopCrowns(
      user.discordID,
      user.serverID,
      undefined
    );

    this.logEvent(crowns, CrownEventString.userBanned, banner, {
      secondaryUser: banTarget,
    });
  }

  async unban(user: User, unbanner: DiscordUser, unbanTarget: DiscordUser) {
    let crowns = await this.crownsService.listTopCrowns(
      user.discordID,
      user.serverID,
      undefined
    );

    this.logEvent(crowns, CrownEventString.userUnbanned, unbanner, {
      secondaryUser: unbanTarget,
    });
  }

  async optOut(discordUser: GuildMember) {
    let crowns = await this.crownsService.listTopCrowns(
      discordUser.user.id,
      discordUser.guild.id,
      -1
    );

    this.logEvent(crowns, CrownEventString.userOptedOut, discordUser.user);
  }

  async handleCheck(crownCheck: CrownCheck, message: Message) {
    let { state, crown, oldCrown } = crownCheck;
    let owner = await User.toDiscordUser(
      message,
      crownCheck.oldCrown!.user.discordID
    );

    switch (state) {
      case CrownState.updated:
        this.update(crown!, message.author, oldCrown!);
        break;

      case CrownState.newCrown:
        this.create(crown!, message.author);
        break;

      case CrownState.snatched:
        this.snatch(
          crown!,
          oldCrown!,
          SnatchedEventString.morePlays,
          message.author,
          owner
        );
        break;

      case CrownState.banned:
        this.snatch(
          crown!,
          oldCrown!,
          SnatchedEventString.userBanned,
          message.author,
          owner
        );
        break;

      case CrownState.inactivity:
        this.snatch(
          crown!,
          oldCrown!,
          SnatchedEventString.userInactive,
          message.author,
          owner
        );
        break;

      case CrownState.purgatory:
        this.snatch(
          crown!,
          oldCrown!,
          SnatchedEventString.userInPurgatory,
          message.author,
          owner
        );
        break;

      case CrownState.left:
        this.snatch(
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
    crown: Crown,
    eventTypes?: CrownEventString[]
  ): Promise<CrownEvent[]> {
    let findOptions: FindConditions<CrownEvent> = { crown };

    if (eventTypes) findOptions.event = In(eventTypes);

    return await CrownEvent.find(findOptions);
  }
}
