import { MessageEmbed } from "discord.js";
import { User } from "../../../../database/entity/User";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { Emoji } from "../../../../lib/Emoji";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { displayLink } from "../../../../lib/views/displays";
import {
  NicknameService,
  UnknownUserDisplay,
} from "../../../../services/Discord/NicknameService";
import { WhoKnowsService } from "../../../../services/Discord/WhoKnowsService";
import {
  MirrorballPrivacy,
  MirrorballUser,
} from "../../../../services/mirrorball/MirrorballTypes";
import { PrivateUserDisplay } from "../../../../services/mirrorball/services/MirrorballUsersService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";

export interface DisplayUserOptions {
  customProfileLink: string;
}

export abstract class WhoKnowsBaseCommand<
  R,
  P,
  A extends ArgumentsMap = {}
> extends MirrorballBaseCommand<R, P, A> {
  private readonly gowonIconURL =
    "https://cdn.discordapp.com/avatars/720135602669879386/a65b2e976bac5821073cacf4a8f8305a.png?size=1024";

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
    return this.newEmbed().setAuthor({
      name: this.isGlobal() ? "Gowon" : this.guild.name,
      url: this.isGlobal() ? this.gowonIconURL : this.guild.iconURL() || "",
    });
  }

  protected displayUser(
    user: MirrorballUser,
    options?: Partial<DisplayUserOptions>
  ): string {
    let nickname = this.nicknameService.cacheGetNickname(
      this.ctx,
      user.discordID
    );

    const profileLink =
      options?.customProfileLink || LinkGenerator.userPage(user.username);

    if (nickname) {
      if (nickname === UnknownUserDisplay) {
        this.whoKnowsService.recordUnknownMember(this.ctx, user.discordID);

        return nickname;
      }

      const display = displayLink(nickname, profileLink);

      return user.discordID === this.author.id ? display.strong() : display;
    }

    switch (user.privacy) {
      case MirrorballPrivacy.Discord:
        return (
          this.nicknameService.cacheGetUsername(this.ctx, user.discordID) ||
          UnknownUserDisplay
        );

      case MirrorballPrivacy.FMUsername:
        return Emoji.lastfm + " " + displayLink(user.username, profileLink);
      case MirrorballPrivacy.Both:
        return displayLink(
          this.nicknameService.cacheGetUsername(this.ctx, user.discordID) ||
            UnknownUserDisplay,
          profileLink
        );

      case MirrorballPrivacy.Private:
      case MirrorballPrivacy.Unset:
        return PrivateUserDisplay;
    }
  }

  protected async cacheUserInfo(users: MirrorballUser[]) {
    await this.nicknameService.cacheNicknames(this.ctx, users);
    if (this.isGlobal()) {
      await this.nicknameService.cacheUsernames(this.ctx, users);
    }
  }
}
