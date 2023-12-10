import { ago } from "../../helpers";
import { italic } from "../../helpers/discord";
import { fishyQuestLevelSize } from "../../helpers/fishy";
import { emDash } from "../../helpers/specialCharacters";
import { calculatePercent } from "../../helpers/stats";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { FishyRarityEmojis } from "../../lib/emoji/FishyRarityEmoji";
import { displayDate, displayNumber } from "../../lib/views/displays";
import { displayFishyCollectionProgress } from "../../lib/views/fishy";
import { FishyRarities } from "../../services/fishy/rarity";
import { FishyChildCommand } from "./FishyChildCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export class Profile extends FishyChildCommand<typeof args> {
  idSeed = "csr sihyeon";
  aliases = ["stats", "fishystats", "fs", "fishyprofile", "fp"];

  description = "See a user's fishy profile";

  arguments = args;

  async run() {
    const { fishyProfile, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      fetchFishyProfile: true,
      fishyProfileRequired: true,
      autoCreateFishyProfile: false,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const [
      giftsGiven,
      giftsReceived,
      biggestFishy,
      rarityBreakdown,
      collection,
    ] = await Promise.all([
      this.fishyService.countGiftsGiven(fishyProfile.user.id),
      this.fishyService.countGiftsReceived(fishyProfile.user.id),
      this.fishyService.getBiggestFishy(fishyProfile.user.id),
      this.fishyService.rarityBreakdown(fishyProfile),
      this.fishyService.getCollection(fishyProfile),
    ]);

    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor(`${perspective.upper.possessive} fishy profile`)
    ).setDescription(`
Level **${fishyProfile.level}** fisher ${emDash} _Fishing since ${displayDate(
      fishyProfile.createdAt
    )} (${ago(fishyProfile.createdAt)})_
${displayNumber(fishyProfile.questsCompleted, "quest")} completed ${emDash} _${
      fishyQuestLevelSize - (fishyProfile.questsCompleted % fishyQuestLevelSize)
    } until next level_
  
**Times fished**: ${displayNumber(fishyProfile.timesFished)} (${displayNumber(
      fishyProfile.totalWeight,
      "kg",
      true
    )} in total)
**Gifts**: ${giftsGiven} given / ${giftsReceived} received ${emDash} _${
      giftsReceived ? calculatePercent(giftsGiven, giftsReceived, 0) : "∞"
    }% ratio_

**Biggest fishy**: ${biggestFishy?.weight}kg (${italic(
      biggestFishy!.fishy.name
    )} on ${displayDate(biggestFishy!.fishedAt)})
**Average weight**: ${displayNumber(
      fishyProfile.totalWeight / fishyProfile.timesFished,
      "kg",
      true
    )}
**Fishy caught**: ${displayFishyCollectionProgress(collection)}

**Rarity breakdown:**
${FishyRarities.Trash.emoji.base} _Trash_ ${emDash} ${displayNumber(
      rarityBreakdown.Trash
    )} trashy
${FishyRarities.Common.emoji.base} _Common_ ${emDash} ${displayNumber(
      rarityBreakdown.Common
    )} fishy
${FishyRarities.Uncommon.emoji.base} _Uncommon_ ${emDash} ${displayNumber(
      rarityBreakdown.Uncommon
    )} fishy
${FishyRarities.Rare.emoji.base} _Rare_ ${emDash} ${displayNumber(
      rarityBreakdown.Rare
    )} fishy
${FishyRarities.SuperRare.emoji.base} _Super rare_ ${emDash} ${displayNumber(
      rarityBreakdown.SuperRare
    )} fishy
${FishyRarities.Legendary.emoji.base} _Legendary_ ${emDash} ${displayNumber(
      rarityBreakdown.Legendary
    )} fishy
${
  "special" in rarityBreakdown
    ? `${FishyRarityEmojis.unknown.base} _Special_ ${emDash} ${displayNumber(
        rarityBreakdown.special as string
      )} fishy`
    : ""
}
`);

    await this.send(embed);
  }
}
