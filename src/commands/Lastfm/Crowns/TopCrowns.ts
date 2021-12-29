import { asyncMap } from "../../../helpers";
import { displayNumber } from "../../../lib/views/displays";
import { CrownsChildCommand } from "./CrownsChildCommand";

export class TopCrowns extends CrownsChildCommand {
  idSeed = "wjsn meiqi";

  description = "Lists the top crowns in the server";
  aliases = ["top", "stans"];
  usage = "";

  async run() {
    let serverUsers = await this.serverUserIDs({
      filterCrownBannedUsers: true,
    });

    let [crowns, crownsCount] = await Promise.all([
      this.crownsService.listTopCrownsInServer(this.ctx, 10, serverUsers),
      this.crownsService.countAllInServer(this.ctx, serverUsers),
    ]);

    let embed = this.newEmbed()
      .setTitle(`Top crowns in ${this.guild.name}`)
      .setDescription(
        (
          await asyncMap(
            crowns,
            async (c, idx) =>
              `${idx + 1}. ${c.artistName} (${displayNumber(
                c.plays
              ).strong()}, ${await this.fetchUsername(c.user.discordID)})`
          )
        ).join("\n") +
          `\n\nThere are **${displayNumber(crownsCount, "** crown")} in ${
            this.guild.name
          }`
      );

    await this.send(embed);
  }
}
