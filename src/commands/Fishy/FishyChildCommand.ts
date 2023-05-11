import { FishyProfile } from "../../database/entity/fishy/FishyProfile";
import {
  MentionedUserHasNoFishyProfileError,
  SenderUserHasNoFishyProfileError,
} from "../../errors/commands/fishy";
import { BaseChildCommand } from "../../lib/command/ParentCommand";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import {
  GetMentionsOptions,
  Mentions,
} from "../../services/arguments/mentions/MentionsService.types";
import { FishyService } from "../../services/fishy/FishyService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export type FishyMentions<Required = false> = Mentions & {
  senderFishyProfile?: FishyProfile;
  mentionedFishyProfile?: FishyProfile;
  fishyProfile: Required extends true ? FishyProfile : FishyProfile | undefined;
};

type FishyOptions = Partial<GetMentionsOptions> & {
  fetchFishyProfile?: boolean;
  fishyProfileRequired?: boolean;
  autoCreateFishyProfile?: boolean;
};

export abstract class FishyChildCommand<
  T extends ArgumentsMap = ArgumentsMap
> extends BaseChildCommand<T> {
  parentName = "fishy";
  category = "fishy";

  fishyService = ServiceRegistry.get(FishyService);

  async getMentions(
    options: FishyOptions & { fishyProfileRequired: true }
  ): Promise<FishyMentions<true>>;
  async getMentions(options: FishyOptions): Promise<FishyMentions>;
  async getMentions(options: FishyOptions): Promise<FishyMentions> {
    const mentions = (await super.getMentions(options)) as FishyMentions;

    if (options.fetchFishyProfile) {
      const [senderFishyProfile, mentionedFishyProfile] =
        await this.fetchFishyProfiles(mentions, options);

      mentions.senderFishyProfile = senderFishyProfile!;
      mentions.mentionedFishyProfile = mentionedFishyProfile;

      if (mentions.mentionedDBUser) {
        mentions.fishyProfile = mentionedFishyProfile;
      } else mentions.fishyProfile = senderFishyProfile;
    }

    if (options.fishyProfileRequired) {
      this.ensureFishyProfile(mentions);
    }

    return mentions as FishyMentions<true>;
  }

  private ensureFishyProfile(mentions: FishyMentions): void {
    if (mentions.mentionedDBUser && !mentions.mentionedFishyProfile) {
      throw new MentionedUserHasNoFishyProfileError();
    } else if (!mentions.mentionedDBUser && !mentions.senderFishyProfile) {
      throw new SenderUserHasNoFishyProfileError(this.prefix);
    }
  }

  private async fetchFishyProfiles(
    mentions: FishyMentions,
    options: FishyOptions
  ): Promise<[FishyProfile | undefined, FishyProfile | undefined]> {
    return await Promise.all([
      mentions.senderUser
        ? this.fishyService.getFishyProfile(
            mentions.senderUser,
            options.autoCreateFishyProfile ?? true
          )
        : undefined,
      mentions.mentionedDBUser
        ? this.fishyService.getFishyProfile(
            mentions.mentionedDBUser,
            options.autoCreateFishyProfile ?? true
          )
        : undefined,
    ]);
  }
}
