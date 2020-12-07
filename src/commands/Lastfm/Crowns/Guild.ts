import { CrownsChildCommand } from "./CrownsChildCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { Delegate } from "../../../lib/command/BaseCommand";
import { GuildAround } from "./GuildAround";
import { GuildAt } from "./GuildAt";

export class Guild extends CrownsChildCommand {
  idSeed = "weki meki rina";

  description = "Shows the server's crowns leaderboard";
  aliases = ["leaderboard", "ldb"];
  usage = "";

  arguments: Arguments = {
    inputs: {
      me: { regex: /me/gi, index: 0 },
      rank: { regex: /[0-9]+/, index: 0 },
    },
  };

  delegates: Delegate[] = [
    {
      when: (args) => args.me,
      delegateTo: GuildAround,
    },
    {
      when: (args) => args.rank,
      delegateTo: GuildAt,
    },
  ];

  async run() {
    let serverUsers = await this.serverUserIDs({
      filterCrownBannedUsers: true,
    });

    let [holders, crownsCount] = await Promise.all([
      this.crownsService.guild(this.guild, 20, serverUsers),
      this.crownsService.countAllInServer(this.guild.id, serverUsers),
    ]);

    let embed = this.newEmbed()
      .setTitle(`${this.guild.name}'s crown leaderboard`)
      .setDescription(
        `There ${crownsCount === 1 ? "is" : "are"} **${numberDisplay(
          crownsCount,
          "** crown"
        )} in ${this.guild.name}\n\n` +
          (
            await Promise.all(
              holders.map(
                async (h, idx) =>
                  `${idx + 1}. ${await this.gowonClient.userDisplay(
                    this.message,
                    h.user
                  )} with ${numberDisplay(h.numberOfCrowns, "crown").strong()}`
              )
            )
          ).join("\n")
      );

    await this.send(embed);
  }
}
