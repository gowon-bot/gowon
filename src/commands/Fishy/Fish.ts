import { CantFishYetError } from "../../errors/fishy";
import { bold, italic, mentionGuildMember } from "../../helpers/discord";
import { emDash } from "../../helpers/specialCharacters";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { displayNumber } from "../../lib/views/displays";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { FishyService } from "../../services/fishy/FishyService";
import { FishyChildCommand } from "./FishyChildCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export class Fish extends FishyChildCommand<typeof args> {
  idSeed = "le sserafim yunjin";
  aliases = ["fishy", "fosh", "foshy", "fush", "fushy", "gofish"];

  description = "Grab a seat by the water and catch some fish :)";

  arguments = args;

  fishyService = ServiceRegistry.get(FishyService);

  async run() {
    const { senderFishyProfile, mentionedFishyProfile } =
      await this.getMentions({
        dbUserRequired: true,
        fetchFishyProfile: true,
        autoCreateFishyProfile: true,
      });

    if (!senderFishyProfile?.canFish()) {
      throw new CantFishYetError(senderFishyProfile!);
    }

    const fishyResult = this.fishyService.fish();

    if (mentionedFishyProfile) {
      await this.fishyService.saveFishy(
        this.ctx,
        fishyResult,
        mentionedFishyProfile,
        senderFishyProfile
      );
    } else {
      await this.fishyService.saveFishy(
        this.ctx,
        fishyResult,
        senderFishyProfile
      );
    }

    const { fishy, weight } = fishyResult;

    const weightDisplay = fishy.rarity.isTrash()
      ? ``
      : `\nIt weighs **${displayNumber(weight)}kg**`;

    await this.fishyService.updateCooldown(senderFishyProfile);

    const giftDisplay = !mentionedFishyProfile
      ? ""
      : ` for ${mentionGuildMember(mentionedFishyProfile.user.discordID)}`;

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Fishy fish"))
      .setColor(fishy.rarity.colour)
      .setDescription(
        `${fishy.emoji} Caught a ${bold(fishy.name)}${giftDisplay}!  ${italic(
          emDash + " " + fishy.rarity.name
        )}
${weightDisplay}`
      );

    await this.send(embed);
  }
}
