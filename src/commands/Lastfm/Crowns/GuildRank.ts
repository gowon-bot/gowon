import { UserHasNoCrownsInServerError } from "../../../errors/crowns";
import { getOrdinal } from "../../../helpers";
import { bold } from "../../../helpers/discord";
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
    const { perspective, dbUser } = await this.getMentions({
      dbUserRequired: true,
    });

    const rank = await this.crownsService.getRank(
      this.ctx,
      dbUser.id,
      await this.serverUserIDs({ filterCrownBannedUsers: true })
    );

    if (!rank?.count) {
      throw new UserHasNoCrownsInServerError(perspective);
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Crowns rank"))
      .setDescription(
        `${perspective.upper.possessive} ${bold(
          displayNumber(rank.count, "crown")
        )} ${rank.count === 1 ? "ranks" : "rank"} ${
          perspective.objectPronoun
        } ${bold(getOrdinal(rank.rank))} in ${
          this.guild?.name
        } out of ${displayNumber(rank.totalUsers, "total user")}`
      );

    await this.send(embed);
  }
}
