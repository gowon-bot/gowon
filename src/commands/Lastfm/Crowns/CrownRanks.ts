import { UserHasNoCrownsInServerError } from "../../../errors/crowns";
import { bold } from "../../../helpers/discord";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/views/displays";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export class CrownRanks extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki elly";

  description =
    "Lists your top crowns and their ranks relative to the server's top crowns";
  aliases = ["stan", "ranks"];
  usage = ["", "@user"];

  slashCommand = true;
  slashCommandName = "ranks";

  arguments = args;

  async run() {
    const { discordUser, dbUser } = await this.getMentions({
      fetchDiscordUser: true,
      dbUserRequired: true,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const [crownRanks, crownsCount] = await Promise.all([
      this.crownsService.crownRanks(this.ctx, dbUser.id),
      this.crownsService.count(this.ctx, dbUser.id),
    ]);

    if (!crownsCount) {
      throw new UserHasNoCrownsInServerError(perspective);
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Crown ranks"))
      .setTitle(`The ranks of ${discordUser?.username}'s top crowns in Last.fm`)
      .setDescription(
        crownRanks
          .map(
            (cr) =>
              `\`${displayNumber(cr.rank)}.\` ${cr.artistName} - ${bold(
                displayNumber(cr.plays, "play")
              )}`
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
