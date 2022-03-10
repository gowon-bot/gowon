import { CrownsChildCommand } from "./CrownsChildCommand";
import { LogicError } from "../../../errors/errors";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";

const args = {
  ...standardMentions,
} as const;

export class CrownRanks extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki elly";

  description =
    "Lists your top crowns and their ranks relative to the server's top crowns";
  aliases = ["stan", "ranks"];
  usage = "";

  slashCommand = true;
  slashCommandName = "ranks";

  arguments = args;

  async run() {
    const { discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const [crownRanks, crownsCount] = await Promise.all([
      this.crownsService.crownRanks(this.ctx, discordUser!.id),
      this.crownsService.count(this.ctx, discordUser!.id),
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
          )} in ${this.requiredGuild.name}`
      );

    await this.send(embed);
  }
}
