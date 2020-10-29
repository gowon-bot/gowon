import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { Delegate } from "../../../lib/command/BaseCommand";
import { GuildAround } from "./GuildAround";
import { GuildAt } from "./GuildAt";

export class TopCrownHolders extends CrownsChildCommand {
  description = "Lists the top crown holders in the server";
  aliases = ["leaderboard", "ldb", "guild"];
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

  async run(message: Message) {
    let [holders, crownsCount] = await Promise.all([
      this.crownsService.topCrownHolders(this.guild.id, message, 20),
      this.crownsService.countAllInServer(this.guild.id),
    ]); 

    let embed = this.newEmbed()
      .setTitle(`Crowns in ${this.guild.name}`)
      .setDescription(
        `There ${crownsCount === 1 ? "is" : "are"} **${numberDisplay(
          crownsCount,
          "** crown"
        )} in ${this.guild.name}\n\n` +
          holders
            .map(
              (h, idx) =>
                `${idx + 1}) ${h.user.username} ― ${numberDisplay(
                  h.numberOfCrowns,
                  "crown"
                ).bold()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
