import { CrownsChildCommand } from "./CrownsChildCommand";
import { LogicError } from "../../../errors";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";
import { asyncMap } from "../../../helpers";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";

const args = {
  rank: new NumberArgument({ required: true }),
} as const;

export class GuildAt extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn bona";

  description =
    "Shows the user at a given rank on the crowns leaderboard, and the surrounding users";
  usage = "rank";

  arguments = args;

  async run() {
    let rank = this.parsedArguments.rank;

    let guildAt = await this.crownsService.guildAt(
      this.ctx,
      rank,
      await this.serverUserIDs({ filterCrownBannedUsers: true })
    );
    let highlighted = guildAt.users.find((u) => toInt(u.rank) === rank);

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
          await asyncMap(
            guildAt.users,
            async (u) =>
              `${u.rank}. ${
                u.discordID === highlighted?.discordID ? "**" : ""
              }${await this.fetchUsername(u.discordID)}${
                u.discordID === highlighted?.discordID ? "**" : ""
              } with ${displayNumber(u.count, "crown")}`
          )
        ).join("\n")}`
      );

    await this.send(embed);
  }
}
