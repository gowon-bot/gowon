import { LogicError } from "../../../errors/errors";
import { asyncMap } from "../../../helpers";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/views/displays";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export class GuildAround extends CrownsChildCommand {
  idSeed = "weki meki doyeon";

  aliases = ["guildme"];
  description =
    "Ranks a user based on their crown count, and shows the surrounding users";
  usage = ["", "@user"];

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

    const discordID = discordUser?.id || this.author.id;

    const guildAround = await this.crownsService.guildAround(
      this.ctx,
      this.requiredGuild.id,
      dbUser.id,
      await this.serverUserIDs({ filterCrownBannedUsers: true })
    );

    const author = guildAround.users.find((u) => u.discordID === discordID);

    if (!guildAround.users.length || !author)
      throw new LogicError(
        `hmmm... I couldn't find you on the crowns leaderboard!`
      );

    const embed = this.newEmbed()
      .setAuthor({
        name: `${this.requiredGuild.name}'s crown leaderboard (${
          guildAround.start + 1
        } - ${guildAround.end})`,
      })
      .setDescription(
        `${(
          await asyncMap(
            guildAround.users,
            async (u) =>
              `${u.rank}. ${
                u.discordID === author?.discordID ? "**" : ""
              }${await this.fetchUsername(u.discordID)}${
                u.discordID === author?.discordID ? "**" : ""
              } with ${displayNumber(u.count, "crown")}`
          )
        ).join("\n")}
        
        ${perspective.upper.possessive} position is #${
          author!.rank
        } with ${displayNumber(author!.count, "crown")}`
      );

    await this.send(embed);
  }
}
