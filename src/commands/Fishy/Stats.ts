import { ago } from "../../helpers";
import { italic } from "../../helpers/discord";
import { emDash } from "../../helpers/specialCharacters";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { Emoji } from "../../lib/emoji/Emoji";
import { displayDate, displayNumber } from "../../lib/views/displays";
import { FishyRarities } from "../../services/fishy/Fishy";
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

    const [giftsGiven, giftsReceived, biggestFishy, rarityBreakdown] =
      await Promise.all([
        this.fishyService.countGiftsGiven(fishyProfile.user.id),
        this.fishyService.countGiftsReceived(fishyProfile.user.id),
        this.fishyService.getBiggestFishy(fishyProfile.user.id),
        this.fishyService.rarityBreakdown(fishyProfile),
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
**Gifts received**: ${giftsReceived}

**Biggest fishy**: ${biggestFishy?.weight} (${italic(
      biggestFishy!.fishy.name
    )} on ${displayDate(biggestFishy!.fishedAt)})
**Average weight**: ${displayNumber(
      fishyProfile.totalWeight / fishyProfile.timesFished,
      "kg",
      true
    )}

**Rarity breakdown:**
${FishyRarities.Trash.emoji} _Trash_ ${emDash} ${displayNumber(
      rarityBreakdown.Trash
    )} fishy
${FishyRarities.Common.emoji} _Common_ ${emDash} ${displayNumber(
      rarityBreakdown.Common
    )} fishy
${FishyRarities.Uncommon.emoji} _Uncommon_ ${emDash} ${displayNumber(
      rarityBreakdown.Uncommon
    )} fishy
${FishyRarities.Rare.emoji} _Rare_ ${emDash} ${displayNumber(
      rarityBreakdown.Rare
    )} fishy
${FishyRarities.SuperRare.emoji} _Super rare_ ${emDash} ${displayNumber(
      rarityBreakdown.SuperRare
    )} fishy
${FishyRarities.Legendary.emoji} _Legendary_ ${emDash} ${displayNumber(
      rarityBreakdown.Legendary
    )} fishy
${
  "special" in rarityBreakdown
    ? `${Emoji.unknown} _Special_ ${emDash} ${displayNumber(
        rarityBreakdown.special as string
      )} fishy`
    : ""
}
`);

    await this.send(embed);
  }
}
