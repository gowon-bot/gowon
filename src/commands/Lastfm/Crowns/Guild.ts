import { CrownsChildCommand } from "./CrownsChildCommand";
import { Delegate } from "../../../lib/command/BaseCommand";
import { GuildAround } from "./GuildAround";
import { GuildAt } from "./GuildAt";
import { displayNumber } from "../../../lib/views/displays";
import { asyncMap } from "../../../helpers";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";

const args = {
  me: new StringArgument({ match: ["me"] }),
  rank: new NumberArgument(),
} as const;

export class Guild extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki rina";

  description = "Shows the server's crowns leaderboard";
  aliases = ["leaderboard", "ldb", "lb"];
  usage = "";

  arguments = args;

  delegates: Delegate<typeof args>[] = [
    {
      when: (args) => !!args.me,
      delegateTo: GuildAround,
    },
    {
      when: (args) => !!args.rank && !isNaN(args.rank),
      delegateTo: GuildAt,
    },
  ];

  async run() {
    const serverUsers = await this.serverUserIDs({
      filterCrownBannedUsers: true,
    });

    const [holders, crownsCount] = await Promise.all([
      this.crownsService.guildLeaderboard(this.ctx, 20, serverUsers),
      this.crownsService.countAllInServer(this.ctx, serverUsers),
    ]);

    const embed = this.newEmbed()
      .setTitle(`${this.guild.name}'s crown leaderboard`)
      .setDescription(
        `There ${crownsCount === 1 ? "is" : "are"} **${displayNumber(
          crownsCount,
          "** crown"
        )} in ${this.guild.name}\n\n` +
          (
            await asyncMap(
              holders,
              async (h, idx) =>
                `${idx + 1}. ${await this.gowonClient.userDisplay(
                  this.message,
                  h.user
                )} with ${displayNumber(h.numberOfCrowns, "crown").strong()}`
            )
          ).join("\n")
      );

    await this.send(embed);
  }
}
