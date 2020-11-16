import { CrownsChildCommand } from "./CrownsChildCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LogicError } from "../../../errors";

export class CrownRanks extends CrownsChildCommand {
  description =
    "Lists your top crowns and their ranks relative to the server's top crowns";
  aliases = ["stan", "ranks"];
  usage = "";

  arguments: Arguments = {
    mentions: standardMentions,
  };

  async run() {
    let { discordUser } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { lastFM: true },
    });

    let perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    let [crownRanks, crownsCount] = await Promise.all([
      this.crownsService.crownRanks(this.guild.id, discordUser!.id),
      this.crownsService.count(discordUser!.id, this.guild.id),
    ]);

    if (!crownsCount)
      throw new LogicError(
        `${perspective.name} doesn't have any crowns in this server!`
      );

    let embed = this.newEmbed()
      .setTitle(`The ranks of ${discordUser?.username}'s top crowns in Last.fm`)
      .setDescription(
        crownRanks
          .map(
            (cr) =>
              `${numberDisplay(cr.rank)}. ${cr.artistName} - ${numberDisplay(
                cr.plays,
                "play"
              ).bold()}`
          )
          .join("\n") +
          `\n\n${perspective.upper.plusToHave} ${numberDisplay(
            crownsCount,
            "crown"
          )} in ${this.guild.name}`
      );

    await this.send(embed);
  }
}
