import { CrownsChildCommand } from "./CrownsChildCommand";
import { numberDisplay } from "../../../helpers";

export class TopCrowns extends CrownsChildCommand {
  description = "Lists the top crowns in the server";
  aliases = ["top", "stans"];
  usage = "";

  async run() {
    let [crowns, crownsCount] = await Promise.all([
      this.crownsService.listTopCrownsInServer(this.guild.id),
      this.crownsService.countAllInServer(this.guild.id),
    ]);

    let embed = this.newEmbed()
      .setTitle(`Top crowns in ${this.guild.name}`)
      .setDescription(
        (
          await Promise.all(
            crowns.map(
              async (c, idx) =>
                `${idx + 1}. ${c.artistName} - ${numberDisplay(
                  c.plays,
                  "play"
                ).bold()} (${await this.fetchUsername(c.user.discordID)})`
            )
          )
        ).join("\n") +
          `\n\nThere are **${numberDisplay(crownsCount, "** crown")} in ${
            this.guild.name
          }`
      );

    await this.send(embed);
  }
}
