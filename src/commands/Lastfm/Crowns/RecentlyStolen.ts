import { ago } from "../../../helpers";
import { bold } from "../../../helpers/discord";
import { CrownsChildCommand } from "./CrownsChildCommand";

export class RecentlyStolen extends CrownsChildCommand {
  idSeed = "wjsn soobin";

  description = "Lists the crowns that were most recently stolen";
  aliases = ["recent", "stolen", "rs"];
  usage = "";

  slashCommand = true;

  async run() {
    const crowns = await this.crownsService.listRecentlyStolen(
      this.ctx,
      10,
      await this.serverUserIDs({ filterCrownBannedUsers: true })
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Crowns recently stolen"))
      .setTitle(`Recently stolen crowns in ${this.requiredGuild.name}`)
      .setDescription(
        crowns
          .map((c) => `${bold(c.artistName)} ― yoinked ${ago(c.lastStolen)}`)
          .join("\n")
      );

    await this.send(embed);
  }
}
