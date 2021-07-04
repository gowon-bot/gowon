import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LogicError } from "../../../errors";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  mentions: standardMentions,
} as const;

export class CrownRanks extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki elly";

  description =
    "Lists your top crowns and their ranks relative to the server's top crowns";
  aliases = ["stan", "ranks"];
  usage = "";

  arguments: Arguments = args;

  async run() {
    const { discordUser } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const [crownRanks, crownsCount] = await Promise.all([
      this.crownsService.crownRanks(this.guild.id, discordUser!.id),
      this.crownsService.count(discordUser!.id, this.guild.id),
    ]);

    if (!crownsCount)
      throw new LogicError(
        `${perspective.name} doesn't have any crowns in this server!`
      );

    const embed = this.newEmbed()
      .setTitle(`The ranks of ${discordUser?.username}'s top crowns in Last.fm`)
      .setDescription(
        crownRanks
          .map(
            (cr) =>
              `${displayNumber(cr.rank)}. ${cr.artistName} - ${displayNumber(
                cr.plays,
                "play"
              ).strong()}`
          )
          .join("\n") +
          `\n\n${perspective.upper.plusToHave} ${displayNumber(
            crownsCount,
            "crown"
          )} in ${this.guild.name}`
      );

    await this.send(embed);
  }
}
