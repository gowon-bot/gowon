import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";
import { getOrdinal } from "../../../helpers";
import { LogicError } from "../../../errors";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";

const args = {
  ...standardMentions,
} as const;

export class Rank extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn exy";

  aliases = ["r"];
  description =
    "Ranks a user on the crowns leaderboard based on their crown count";
  usage = ["", "@user"];

  arguments = args;

  async run(message: Message) {
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
        `${perspective.upper.possessive} ${displayNumber(
          rank.count,
          "crown"
        ).strong()} ${toInt(rank.count) === 1 ? "ranks" : "rank"} ${
          perspective.objectPronoun
        } ${getOrdinal(toInt(rank.rank)).strong()} in ${
          message.guild?.name
        } out of ${displayNumber(rank.totalUsers, "total user")}`
      );

    await this.send(embed);
  }
}
