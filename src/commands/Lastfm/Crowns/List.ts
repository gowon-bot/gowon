import { CrownsChildCommand } from "./CrownsChildCommand";
import { numberDisplay, getOrdinal } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export class List extends CrownsChildCommand {
  description = "Lists a user's top crowns";
  usage = ["", "@user"];

  arguments: Arguments = {
    mentions: standardMentions,
  };

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
        `${perspective.upper.plusToHave} **${numberDisplay(
          crownsCount,
          "** crown"
        )} in ${this.guild.name} (ranked ${getOrdinal(
          rank.rank.toInt()
        ).bold()})\n\n` +
          crowns
            .map(
              (c) =>
                `${numberDisplay(c.plays, "play").bold()} - ${c.artistName}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
