import { User } from "../../../database/entity/User";
import {
  CrownBannedError,
  InactiveError,
  OptedOutError,
  PurgatoryError,
} from "../../../errors/errors";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { CrownsService } from "../../../services/dbservices/crowns/CrownsService";
import { CrownsUserService } from "../../../services/dbservices/crowns/CrownsUserService";
import { LastFMBaseChildCommand } from "../LastFMBaseCommand";

export abstract class CrownsChildCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseChildCommand<T> {
  crownsService = ServiceRegistry.get(CrownsService);
  crownsUserService = ServiceRegistry.get(CrownsUserService);

  parentName = "crowns";
  subcategory = "crowns";

  guildRequired = true;

  protected async ensureUserCanCheck(senderUser: User): Promise<void> {
    const userIsInPurgatory = await this.crownsUserService.isInPurgatory(
      this.ctx,
      senderUser.discordID
    );
    if (userIsInPurgatory) throw new PurgatoryError();

    const userIsInactive = await this.crownsUserService.isInactive(
      this.ctx,
      senderUser.discordID
    );
    if (userIsInactive) throw new InactiveError();

    const userIsCrownBanned = await this.crownsUserService.isCrownBanned(
      this.ctx,
      senderUser.discordID
    );
    if (userIsCrownBanned) throw new CrownBannedError();

    const userIsOptedOut = await this.crownsUserService.isOptedOut(
      this.ctx,
      senderUser.discordID
    );
    if (userIsOptedOut) throw new OptedOutError();
  }
}
