import { ago } from "../../helpers";
import { italic } from "../../helpers/discord";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { displayDate, displayNumber } from "../../lib/views/displays";
import { FishyChildCommand } from "./FishyChildCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export class Stats extends FishyChildCommand<typeof args> {
  idSeed = "csr sihyeon";
  aliases = ["fishystats", "fs"];

  description = "See stats about a user's fishing";

  arguments = args;

  async run() {
    const { fishyProfile } = await this.getMentions({
      fetchFishyProfile: true,
      fishyProfileRequired: true,
      autoCreateFishyProfile: false,
    });

    const [giftsGiven, giftsRecieved, biggestFishy] = await Promise.all([
      this.fishyService.countGiftsGiven(fishyProfile.user.id),
      this.fishyService.countGiftsRecieved(fishyProfile.user.id),
      this.fishyService.getBiggestFishy(fishyProfile.user.id),
    ]);

    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor("Fishy stats")
    ).setDescription(`
_Fishing since ${displayDate(fishyProfile.createdAt)} (${ago(
      fishyProfile.createdAt
    )})_

**Total weight**: ${displayNumber(fishyProfile.totalWeight, "kg", true)}
**Times fished**: ${displayNumber(fishyProfile.timesFished)}

**Gifts given**:    ${giftsGiven}
**Gifts recieved**: ${giftsRecieved}

**Biggest fishy**: ${biggestFishy?.weight} (${italic(
      biggestFishy!.fishy.name
    )} on ${displayDate(biggestFishy!.fishedAt)})
**Average weight**: ${displayNumber(
      fishyProfile.totalWeight / fishyProfile.timesFished,
      "kg",
      true
    )}`);

    await this.send(embed);
  }
}
