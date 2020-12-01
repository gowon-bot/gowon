import { CrownsChildCommand } from "./CrownsChildCommand";
import { ago } from "../../../helpers";

export class RecentlyStolen extends CrownsChildCommand {
  description = "Lists the crowns that were most recently stolen";
  aliases = ["recent", "stolen", "rs"];
  usage = "";

  async run() {
    let crowns = await this.crownsService.listRecentlyStolen(
      this.guild.id,
      10,
      await this.serverUserIDs({ filterCrownBannedUsers: true })
    );

    let embed = this.newEmbed()
      .setTitle(`Recently stolen crowns in ${this.guild.name}`)
      .setDescription(
        crowns
          .map((c) => `${c.artistName.strong()} ― yoinked ${ago(c.lastStolen)}`)
          .join("\n")
      );

    await this.send(embed);
  }
}
