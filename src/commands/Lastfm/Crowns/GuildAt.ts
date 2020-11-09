import { CrownsChildCommand } from "./CrownsChildCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";

export class GuildAt extends CrownsChildCommand {
  arguments: Arguments = {
    inputs: {
      rank: { index: 0, number: true },
    },
  };

  async run() {
    let rank = this.parsedArguments.rank as number;

    let guildAt = await this.crownsService.guildAt(
      this.guild.id,
      rank,
      await this.serverUserIDs({ filterCrownBannedUsers: true })
    );
    let highlighted = guildAt.users.find((u) => u.rank.toInt() === rank);

    if (!guildAt.users.length)
      throw new LogicError(
        `hmmm... I couldn't find that rank on the crowns leaderboard!`
      );

    let embed = this.newEmbed()
      .setAuthor(
        `${this.guild.name}'s crown leaderboard (${guildAt.start + 1} - ${
          guildAt.end
        })`
      )
      .setDescription(
        `${(
          await Promise.all(
            guildAt.users.map(
              async (u) =>
                `${u.rank}. ${
                  u.discordID === highlighted?.discordID ? "**" : ""
                }${await this.fetchUsername(u.discordID)}${
                  u.discordID === highlighted?.discordID ? "**" : ""
                } with ${numberDisplay(u.count, "crown")}`
            )
          )
        ).join("\n")}`
      );

    await this.send(embed);
  }
}
