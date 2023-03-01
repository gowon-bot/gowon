import { LogicError } from "../../../errors/errors";
import { asyncMap } from "../../../helpers";
import { toInt } from "../../../helpers/lastfm/";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/views/displays";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  rank: new NumberArgument({ required: true }),
} satisfies ArgumentsMap;

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
      .setAuthor({
        name: `${this.requiredGuild.name}'s crown leaderboard (${
          guildAt.start + 1
        } - ${guildAt.end})`,
      })
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
