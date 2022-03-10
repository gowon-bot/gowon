import { CrownsChildCommand } from "./CrownsChildCommand";
import { LogicError } from "../../../errors/errors";
import { displayNumber } from "../../../lib/views/displays";
import { asyncMap } from "../../../helpers";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";

const args = {
  ...standardMentions,
} as const;

export class GuildAround extends CrownsChildCommand {
  idSeed = "weki meki doyeon";

  aliases = ["guildme"];
  description =
    "Ranks a user based on their crown count, and shows the surrounding users";
  usage = ["", "@user"];

  arguments = args;

  async run() {
    let { discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    let discordID = discordUser?.id || this.author.id;

    let guildAround = await this.crownsService.guildAround(
      this.ctx,
      this.requiredGuild.id,
      discordID,
      await this.serverUserIDs({ filterCrownBannedUsers: true })
    );
    let author = guildAround.users.find((u) => u.discordID === discordID);

    if (!guildAround.users.length || !author)
      throw new LogicError(
        `hmmm... I couldn't find you on the crowns leaderboard!`
      );

    let embed = this.newEmbed()
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
