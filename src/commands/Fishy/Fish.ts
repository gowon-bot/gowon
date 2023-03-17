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
    const { dbUser, senderUser } = await this.getMentions({
      dbUserRequired: true,
    });

    const fishyResult = this.fishyService.fish();

    await this.fishyService.saveFishy(this.ctx, fishyResult, dbUser);

    const { fishy, weight } = fishyResult;

    const weightDisplay = fishy.rarity.isTrash()
      ? ``
      : `\nIt weighs **${displayNumber(weight)}kg**`;

    const giftDisplay =
      dbUser.id === senderUser?.id
        ? ""
        : ` for ${mentionGuildMember(dbUser.discordID)}`;

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
