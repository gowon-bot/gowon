import { LogicError } from "../../../errors/errors";
import { getOrdinal } from "../../../helpers";
import { bold } from "../../../helpers/discord";
import { toInt } from "../../../helpers/lastfm/";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/views/displays";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export class GuildUserRank extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn exy";

  aliases = ["rank", "guildrank", "serverrank", "r"];
  description =
    "Ranks a user on the crowns leaderboard based on their crown count";
  usage = ["", "@user"];

  arguments = args;

  async run() {
    const { perspective, discordUser, dbUser } = await this.getMentions();

    let rank = await this.crownsService.getRank(
      this.ctx,
      discordUser?.id || dbUser.discordID || this.author.id,
      await this.serverUserIDs({ filterCrownBannedUsers: true })
    );

    if (!toInt(rank?.count))
      throw new LogicError(
        `${perspective.plusToHave} no crowns in this server!`
      );

    let embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Crowns rank"))
      .setDescription(
        `${perspective.upper.possessive} ${bold(
          displayNumber(rank.count, "crown")
        )} ${toInt(rank.count) === 1 ? "ranks" : "rank"} ${
          perspective.objectPronoun
        } ${bold(getOrdinal(toInt(rank.rank)))} in ${
          this.guild?.name
        } out of ${displayNumber(rank.totalUsers, "total user")}`
      );

    await this.send(embed);
  }
}
