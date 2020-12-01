import { CrownsChildCommand } from "./CrownsChildCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export class GuildAround extends CrownsChildCommand {
  aliases = ["guildme"];
  description =
    "Ranks a user based on their crown count, and shows the surrounding users";
  usage = ["", "@user"];

  arguments: Arguments = {
    mentions: standardMentions,
  };

  async run() {
    let { discordUser } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { lastFM: true },
    });

    let discordID = discordUser?.id || this.author.id;

    let guildAround = await this.crownsService.guildAround(
      this.guild.id,
      discordID,
      await this.serverUserIDs({ filterCrownBannedUsers: true })
    );
    let author = guildAround.users.find((u) => u.discordID === discordID);

    if (!guildAround.users.length || !author)
      throw new LogicError(
        `hmmm... I couldn't find you on the crowns leaderboard!`
      );

    let embed = this.newEmbed()
      .setAuthor(
        `${this.guild.name}'s crown leaderboard (${guildAround.start + 1} - ${
          guildAround.end
        })`
      )
      .setDescription(
        `${(
          await Promise.all(
            guildAround.users.map(
              async (u) =>
                `${u.rank}. ${
                  u.discordID === author?.discordID ? "**" : ""
                }${await this.fetchUsername(u.discordID)}${
                  u.discordID === author?.discordID ? "**" : ""
                } with ${numberDisplay(u.count, "crown")}`
            )
          )
        ).join("\n")}
        
        Your position is #${author!.rank} with ${numberDisplay(
          author!.count,
          "crown"
        )}`
      );

    await this.send(embed);
  }
}
