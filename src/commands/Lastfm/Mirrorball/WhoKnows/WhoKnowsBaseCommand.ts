import { User } from "../../../../database/entity/User";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { NicknameService } from "../../../../services/Discord/NicknameService";
import {
  DisplayUserOptions,
  WhoKnowsService,
} from "../../../../services/Discord/WhoKnowsService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { LilacPrivacy } from "../../../../services/lilac/LilacAPIService.types";
import { LilacUser } from "../../../../services/lilac/converters/user";
import { MirrorballUser } from "../../../../services/mirrorball/MirrorballTypes";

export abstract class WhoKnowsBaseCommand<
  R,
  P,
  A extends ArgumentsMap = {}
> extends MirrorballBaseCommand<R, P, A> {
  nicknameService = ServiceRegistry.get(NicknameService);
  whoKnowsService = ServiceRegistry.get(WhoKnowsService);
  guildRequired = true;

  protected notIndexedHelp() {
    return `Don't see yourself? Run ${this.prefix}index to download all your data!`;
  }
  protected unsetPrivacyHelp() {
    return `Your privacy is currently unset! See ${this.prefix}privacy for more info`;
  }

  protected isGlobal() {
    return this.variationWasUsed("global");
  }

  protected footerHelp(senderUser?: User, senderLilacUser?: LilacUser) {
    return !senderUser?.isIndexed
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

  protected async cacheUserInfo(users: MirrorballUser[]) {
    await this.nicknameService.cacheNicknames(this.ctx, users);
    if (this.isGlobal()) {
      await this.nicknameService.cacheUsernames(this.ctx, users);
    }
  }
}
