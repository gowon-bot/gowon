import { asyncMap } from "../../../helpers";
import { bold } from "../../../helpers/discord";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { CrownsChildCommand } from "./CrownsChildCommand";

export class TopCrowns extends CrownsChildCommand {
  idSeed = "wjsn meiqi";

  description = "Lists the top crowns in the server";
  aliases = ["top", "stans"];
  usage = "";

  slashCommand = true;
  slashCommandName = "top";

  async run() {
    const serverUsers = await this.serverUserIDs({
      filterCrownBannedUsers: true,
    });

    const [crowns, crownsCount] = await Promise.all([
      this.crownsService.listTopCrownsInServer(this.ctx, 10, serverUsers),
      this.crownsService.countAllInServer(this.ctx, serverUsers),
    ]);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Top crowns"))
      .setTitle(`Top crowns in ${this.requiredGuild.name}`)
      .setDescription(
        displayNumberedList(
          await asyncMap(
            crowns,
            async (c, idx) =>
              `${c.artistName} (${bold(
                displayNumber(c.plays)
              )}, ${await this.fetchUsername(c.user.discordID)})`
          )
        ) +
          `\n\nThere are **${displayNumber(crownsCount, "** crown")} in ${
            this.requiredGuild.name
          }`
      );

    await this.send(embed);
  }
}
