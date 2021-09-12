import { MessageEmbed } from "discord.js";
import { User } from "../../../../database/entity/User";
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
import { ServiceRegistry } from "../../../../services/ServicesRegistry";

export abstract class WhoKnowsBaseCommand<
  R,
  P,
  A
> extends MirrorballBaseCommand<R, P, A> {
  nicknameService = ServiceRegistry.get(NicknameService);
  whoKnowsService = ServiceRegistry.get(WhoKnowsService);

  protected notIndexedHelp() {
    return `Don't see yourself? Run ${this.prefix}index to download all your data!`;
  }
  protected unsetPrivacyHelp() {
    return `Your privacy is currently unset! See ${this.prefix}privacy for more info`;
  }

  protected isGlobal() {
    return this.variationWasUsed("global");
  }

  protected footerHelp(
    senderUser?: User,
    senderMirrorballUser?: MirrorballUser
  ) {
    return !senderUser?.isIndexed
      ? this.notIndexedHelp()
      : this.isGlobal() &&
        senderMirrorballUser?.privacy === MirrorballPrivacy.Unset
      ? this.unsetPrivacyHelp()
      : "";
  }

  protected whoKnowsEmbed(): MessageEmbed {
    return this.newEmbed().setAuthor(
      this.isGlobal() ? "Gowon" : this.guild.name,
      this.isGlobal()
        ? "https://gowon.ca/assets/gowonnies.png"
        : this.guild.iconURL() || ""
    );
  }

  protected displayUser(user: MirrorballUser): string {
    let nickname = this.nicknameService.cacheGetNickname(user.discordID);

    if (nickname) {
      if (nickname === UnknownUserDisplay) {
        this.whoKnowsService.recordUnknownMember(
          this.ctx,
          this.guild.id,
          user.discordID
        );

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
      this.ctx,
      users,
      this.guild.id,
      this.gowonClient
    );
    if (this.isGlobal()) {
      await this.nicknameService.cacheUsernames(
        this.ctx,
        users,
        this.gowonClient
      );
    }
  }
}
