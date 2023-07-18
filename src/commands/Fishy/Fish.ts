import { FishyCatch } from "../../database/entity/fishy/FishyCatch";
import { FishyProfile } from "../../database/entity/fishy/FishyProfile";
import { FishyQuest } from "../../database/entity/fishy/FishyQuest";
import { CantFishYetError } from "../../errors/commands/fishy";
import { bold, italic, mentionGuildMember } from "../../helpers/discord";
import { emDash } from "../../helpers/specialCharacters";
import { LineConsolidator } from "../../lib/LineConsolidator";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { Emoji } from "../../lib/emoji/Emoji";
import { displayNumber } from "../../lib/views/displays";
import { displayFishyLevelUp, displayRarity } from "../../lib/views/fishy";
import { FishyChildCommand } from "./FishyChildCommand";
import { fishyAliases } from "./fishyAliases";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export class Fish extends FishyChildCommand<typeof args> {
  idSeed = "le sserafim yunjin";
  aliases = fishyAliases;

  description = "Grab a seat by the water and catch some fish :)";

  arguments = args;

  async run() {
    const { senderFishyProfile, mentionedFishyProfile, fishyProfile } =
      await this.getMentions({
        dbUserRequired: true,
        fetchFishyProfile: true,
        autoCreateFishyProfile: true,
        fishyProfileRequired: true,
      });

    if (!senderFishyProfile?.canFish()) {
      throw new CantFishYetError(senderFishyProfile!);
    }

    const fishyResult = await this.fishyService.fish(fishyProfile);
    let fishyCatch: FishyCatch;

    if (mentionedFishyProfile) {
      fishyCatch = await this.fishyService.saveFishy(
        this.ctx,
        fishyResult,
        mentionedFishyProfile,
        senderFishyProfile
      );
    } else {
      fishyCatch = await this.fishyService.saveFishy(
        this.ctx,
        fishyResult,
        senderFishyProfile
      );
    }

    const { fishy, weight, isNew } = fishyResult;

    const weightDisplay = fishy.rarity.isTrash()
      ? ``
      : `\nIt weighs **${displayNumber(weight)}kg**`;

    await this.fishyService.updateCooldown(senderFishyProfile);

    const { quest, isNewQuest } = await this.getQuest(senderFishyProfile);
    const { madeQuestProgress, questCompleted } = await this.checkQuestProgress(
      quest,
      fishyCatch,
      senderFishyProfile
    );

    const giftDisplay = !mentionedFishyProfile
      ? ""
      : ` for ${mentionGuildMember(mentionedFishyProfile.user.discordID)}`;

    const fishyDisplay = `${fishy.emoji} ${
      this.extract.didMatch("phishy") ? "Scammed" : ""
    } ${fishy.article}${bold(fishy.name)}${
      isNew ? Emoji.newFishy : ""
    }${giftDisplay}${isNew && !giftDisplay ? "" : "!"}  ${italic(
      emDash + " " + displayRarity(fishy.rarity)
    )}`;

    const lineConsolidator = new LineConsolidator().addLines(
      fishyDisplay,
      weightDisplay,
      {
        shouldDisplay: !isNewQuest && questCompleted,
        string: `\n✨ You have completed your current quest!\nRun \`${this.prefix}fq\` to get a new one.`,
      },
      {
        shouldDisplay: !isNewQuest && madeQuestProgress && !questCompleted,
        string: `\n✨ This fishy counts towards your current quest!`,
      },
      {
        shouldDisplay: isNewQuest && questCompleted,
        string: `\n✨ You got a new quest, and completed it! See \`${this.prefix}fq\` to get a new quest.`,
      },
      {
        shouldDisplay: isNewQuest && madeQuestProgress && !questCompleted,
        string: `\n✨ You got a new quest, and this fishy counts towards it! Run \`${this.prefix}fq\` to see your new quest.`,
      },
      {
        shouldDisplay: isNewQuest && !madeQuestProgress,
        string: `\n✨ You got a new quest! Run \`${this.prefix}fq\` to see it.`,
      }
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Fishy fish"))
      .setColor(fishy.rarity.colour)
      .setDescription(lineConsolidator.consolidate());

    if (isNew) {
      embed.setFooter({
        text: `See ${this.prefix}fishypedia to learn about this fish`,
      });
    }

    await this.send(embed);
  }

  private async getQuest(senderFishyProfile: FishyProfile): Promise<{
    quest: FishyQuest;
    isNewQuest: boolean;
  }> {
    const quest = await this.fishyProgressionService.getCurrentQuest(
      senderFishyProfile
    );

    if (quest) {
      return { quest, isNewQuest: false };
    }

    const newQuest = await this.fishyProgressionService.getNextQuest(
      senderFishyProfile
    );
    await this.fishyProgressionService.saveQuest(newQuest);

    return { quest: newQuest, isNewQuest: true };
  }

  private async checkQuestProgress(
    quest: FishyQuest,
    fishyCatch: FishyCatch,
    fishyProfile: FishyProfile
  ): Promise<{
    madeQuestProgress: boolean;
    questCompleted: boolean;
  }> {
    const madeQuestProgress = this.fishyProgressionService.countsTowardsQuest(
      quest,
      fishyCatch
    );

    let questCompleted = false;

    if (madeQuestProgress) {
      questCompleted =
        await this.fishyProgressionService.incrementQuestProgress(
          quest!,
          fishyProfile
        );
    }

    if (quest.isMilestone && quest.isCompleted) {
      const milestoneCompletedEmbed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Fishy level up"))
        .setDescription(displayFishyLevelUp(fishyProfile.level + 1));

      await this.fishyProgressionService.incrementQuestProgress(
        quest,
        fishyProfile
      );

      this.send(milestoneCompletedEmbed);
    }

    return { questCompleted, madeQuestProgress };
  }
}
