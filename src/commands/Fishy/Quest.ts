import { Chance } from "chance";
import { quote } from "../../helpers/specialCharacters";
import { Emoji } from "../../lib/emoji/Emoji";
import { displayNumber, displayProgressBar } from "../../lib/views/displays";
import { displayFishyLevelUp } from "../../lib/views/fishy";
import { FishyChildCommand } from "./FishyChildCommand";

export class Quest extends FishyChildCommand {
  idSeed = "newjeans minji";
  aliases = ["fishyquest", "fq"];

  description = "Complete fishy quests!";

  async run() {
    const { fishyProfile } = await this.getMentions({
      fetchFishyProfile: true,
      fishyProfileRequired: true,
      autoCreateFishyProfile: false,
    });

    const currentQuest = await this.fishyProgressionService.getCurrentQuest(
      fishyProfile
    );

    if (currentQuest) {
      const embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Fishy quest"))
        .setDescription(
          `Your current quest:
          
${currentQuest.emoji} ${quote(currentQuest.name)}

_Caught ${displayNumber(currentQuest.progress)} of ${displayNumber(
            currentQuest.count
          )} so far_
${displayProgressBar(currentQuest.progress, currentQuest.count)}`
        );

      await this.send(embed);
    } else {
      const quest = await this.fishyProgressionService.getNextQuest(
        fishyProfile
      );
      await this.fishyProgressionService.saveQuest(quest);

      if (quest.isMilestone && quest.isCompleted) {
        const milestoneCompletedEmbed = this.newEmbed()
          .setAuthor(this.generateEmbedAuthor("Fishy level up"))
          .setDescription(
            displayFishyLevelUp(fishyProfile.level + 1) +
              ` See your next quest with \`${this.prefix}fq\``
          );

        await this.fishyProgressionService.incrementQuestProgress(
          quest,
          fishyProfile
        );

        await this.send(milestoneCompletedEmbed);
        return;
      }

      const embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Fishy quest"))
        .setDescription(
          `You've been ${Chance().pickone([
            "given",
            "tasked with",
            "hired for",
          ])} a new ${quest.isMilestone ? "milestone " : ""}quest:\n\n${
            quest.emoji
          }${Emoji.newFishy}${quote(quest.name)}`
        );

      await this.send(embed);
    }
  }
}