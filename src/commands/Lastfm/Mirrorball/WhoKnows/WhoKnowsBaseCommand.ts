import { MessageEmbed } from "discord.js";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Emoji } from "../../../../lib/Emoji";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { displayLink } from "../../../../lib/views/displays";
import {
  NicknameService,
  UnknownUserDisplay,
} from "../../../../services/guilds/NicknameService";
import { WhoKnowsService } from "../../../../services/guilds/WhoKnowsService";
import {
  MirrorballPrivacy,
  MirrorballUser,
} from "../../../../services/mirrorball/MirrorballTypes";
import { PrivateUserDisplay } from "../../../../services/mirrorball/services/MirrorballUsersService";

export abstract class WhoKnowsBaseCommand<
  R,
  P,
  A
> extends MirrorballBaseCommand<R, P, A> {
  nicknameService = new NicknameService(this.logger);
  whoKnowsService = new WhoKnowsService(this.logger);

  protected whoKnowsEmbed(): MessageEmbed {
    return this.newEmbed().setAuthor(
      this.variationWasUsed("global") ? "Gowon" : this.guild.name,
      this.variationWasUsed("global")
        ? "https://gowon.ca/assets/gowonnies.png"
        : this.guild.iconURL() || ""
    );
  }

  protected displayUser(user: MirrorballUser): string {
    let nickname = this.nicknameService.cacheGetNickname(user.discordID);

    if (nickname) {
      if (nickname === UnknownUserDisplay) {
        this.whoKnowsService.recordUnknownMember(this.guild.id, user.discordID);

        return nickname;
      }

      const display = displayLink(
        nickname,
        LinkGenerator.userPage(user.username)
      );

      return user.discordID === this.author.id ? display.strong() : display;
    }

    switch (user.privacy) {
      case MirrorballPrivacy.Discord:
        return displayLink(
          nickname ||
            this.nicknameService.cacheGetUsername(user.discordID) ||
            UnknownUserDisplay,
          LinkGenerator.userPage(user.username)
        );

      case MirrorballPrivacy.FMUsername:
        return (
          Emoji.lastfm +
          " " +
          displayLink(user.username, LinkGenerator.userPage(user.username))
        );

      case MirrorballPrivacy.Private:
      case MirrorballPrivacy.Unset:
        return PrivateUserDisplay;
    }
  }

  protected async cacheUserInfo(users: MirrorballUser[]) {
    await this.nicknameService.cacheNicknames(
      users,
      this.guild.id,
      this.gowonClient
    );
    if (this.variationWasUsed("global")) {
      await this.nicknameService.cacheUsernames(users, this.gowonClient);
    }
  }
}
