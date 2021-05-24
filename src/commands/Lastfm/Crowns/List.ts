import { CrownsChildCommand } from "./CrownsChildCommand";
import { getOrdinal } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  mentions: standardMentions,
} as const;

export class List extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn eunseo";

  description = "Lists a user's top crowns";
  usage = ["", "@user"];

  arguments: Arguments = args;

  async run() {
    let { discordUser: user } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { lastFM: true },
    });

    let discordID = user?.id || this.author.id;

    let perspective = this.usersService.discordPerspective(this.author, user);

    let [crowns, crownsCount, rank] = await Promise.all([
      this.crownsService.listTopCrowns(discordID, this.guild.id),
      this.crownsService.count(discordID, this.guild.id),
      this.crownsService.getRank(discordID, this.guild.id),
    ]);

    if (!crownsCount)
      throw new LogicError(
        `${perspective.name} don't have any crowns in this server!`
      );

    let embed = this.newEmbed()
      .setTitle(`${perspective.upper.possessive} crowns`)
      .setDescription(
        crowns
          .map(
            (c, idx) =>
              `${idx + 1}. ${c.artistName} - ${displayNumber(
                c.plays,
                "play"
              ).strong()}`
          )
          .join("\n") +
          `\n\n${perspective.upper.plusToHave} **${displayNumber(
            crownsCount,
            "** crown"
          )} in ${this.guild.name} (ranked ${getOrdinal(
            toInt(rank.rank)
          ).strong()})`
      );

    await this.send(embed);
  }
}
