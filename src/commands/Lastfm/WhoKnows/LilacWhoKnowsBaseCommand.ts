import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { NicknameService } from "../../../services/Discord/NicknameService";
import {
  DisplayUserOptions,
  WhoKnowsService,
} from "../../../services/Discord/WhoKnowsService";
import { LilacUser } from "../../../services/lilac/converters/user";
import { LilacPrivacy } from "../../../services/lilac/LilacAPIService.types";
import { LilacWhoKnowsService } from "../../../services/lilac/LilacWhoKnowsService";
import { MirrorballUser } from "../../../services/mirrorball/MirrorballTypes";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

export abstract class WhoKnowsBaseCommand<
  A extends ArgumentsMap = {}
> extends LilacBaseCommand<A> {
  protected readonly gowonIconURL =
    "https://cdn.discordapp.com/avatars/720135602669879386/a65b2e976bac5821073cacf4a8f8305a.png?size=1024";

  nicknameService = ServiceRegistry.get(NicknameService);
  whoKnowsService = ServiceRegistry.get(WhoKnowsService);
  lilacWhoKnowsService = ServiceRegistry.get(LilacWhoKnowsService);

  protected notIndexedHelp() {
    return `Don't see yourself? Run ${this.prefix}index to download all your data!`;
  }
  protected unsetPrivacyHelp() {
    return `Your privacy is currently unset! See ${this.prefix}privacy for more info`;
  }

  protected isGlobal() {
    return this.variationWasUsed("global");
  }

  protected footerHelp(senderLilacUser?: LilacUser) {
    return !senderLilacUser?.lastUpdated
      ? this.notIndexedHelp()
      : this.isGlobal() && senderLilacUser?.privacy === LilacPrivacy.Unset
      ? this.unsetPrivacyHelp()
      : "";
  }

  protected displayUser(
    user: MirrorballUser,
    options?: Partial<DisplayUserOptions>
  ): string {
    return this.whoKnowsService.displayUser(this.ctx, user, options);
  }

  protected async cacheUserInfo(users: LilacUser[]) {
    await this.nicknameService.cacheNicknames(this.ctx, users);
    if (this.isGlobal()) {
      await this.nicknameService.cacheUsernames(this.ctx, users);
    }
  }
}
