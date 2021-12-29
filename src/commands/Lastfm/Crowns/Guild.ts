import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Delegate } from "../../../lib/command/BaseCommand";
import { GuildAround } from "./GuildAround";
import { GuildAt } from "./GuildAt";
import { displayNumber } from "../../../lib/views/displays";
import { asyncMap } from "../../../helpers";

const args = {
  inputs: {
    me: { regex: /me/gi, index: 0 },
    rank: { regex: /[0-9]+/, index: 0 },
  },
} as const;

export class Guild extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki rina";

  description = "Shows the server's crowns leaderboard";
  aliases = ["leaderboard", "ldb", "lb"];
  usage = "";

  arguments: Arguments = args;

  delegates: Delegate<typeof args>[] = [
    {
      when: (args) => !!args.me,
      delegateTo: GuildAround,
    },
    {
      when: (args) => !!args.rank,
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
