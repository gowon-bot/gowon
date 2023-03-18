import { FishyProfile } from "../../database/entity/fishy/FishyProfile";
import { BaseChildCommand } from "../../lib/command/ParentCommand";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import {
  GetMentionsOptions,
  Mentions,
} from "../../services/arguments/mentions/MentionsService.types";
import { FishyService } from "../../services/fishy/FishyService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

type FishyMentions = Mentions & {
  senderFishyProfile: FishyProfile;
  mentionedFishyProfile?: FishyProfile;
};

export abstract class FishyChildCommand<
  T extends ArgumentsMap = ArgumentsMap
> extends BaseChildCommand<T> {
  parentName = "fishy";
  category = "fishy";

  fishyService = ServiceRegistry.get(FishyService);

  async getMentions(
    options: Partial<GetMentionsOptions> & {
      fetchFishyProfile?: boolean;
    }
  ): Promise<FishyMentions> {
    const mentions: FishyMentions = (await super.getMentions(
      options
    )) as FishyMentions;

    if (options.fetchFishyProfile) {
      const [senderFishyProfile, mentionedFishyProfile] = await Promise.all([
        mentions.senderUser
          ? this.fishyService.getFishyProfile(mentions.senderUser, true)
          : undefined,
        mentions.mentionedDBUser
          ? this.fishyService.getFishyProfile(mentions.mentionedDBUser, true)
          : undefined,
      ]);

      mentions.senderFishyProfile = senderFishyProfile!;
      mentions.mentionedFishyProfile = mentionedFishyProfile;
    }

    return mentions;
  }
}
