import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";
import { getOrdinal } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  mentions: {
    user: { index: 0 },
  },
} as const;

export class Rank extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn exy";

  aliases = ["r"];
  description =
    "Ranks a user on the crowns leaderboard based on their crown count";
  usage = ["", "@user"];

  arguments: Arguments = args;

  async run(message: Message) {
    let user = this.parsedArguments.user;

    let discordID = user?.id || message.author.id;

    let perspective = this.usersService.discordPerspective(
      message.author,
      user
    );

    let rank = await this.crownsService.getRank(
      discordID,
      message.guild?.id!,
      await this.serverUserIDs({ filterCrownBannedUsers: true })
    );

    if (!toInt(rank?.count))
      throw new LogicError(
        `${perspective.plusToHave} no crowns in this server!`
      );

    let embed = this.newEmbed()
      .setAuthor(
        perspective.upper.possessive + " crowns rank",
        perspective.discordUser?.displayAvatarURL()
      )
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
