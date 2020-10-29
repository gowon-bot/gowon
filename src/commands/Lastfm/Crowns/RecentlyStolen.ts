import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";
import { ago } from "../../../helpers";

export class RecentlyStolen extends CrownsChildCommand {
  description = "Lists the crowns that were most recently stolen";
  aliases = ["recent", "stolen", "rs"];
  usage = "";

  async run(message: Message) {
    let crowns = await this.crownsService.listRecentlyStolen(
      message.guild?.id!
    );

    let embed = this.newEmbed()
      .setTitle(`Recently stolen crowns in ${message.guild?.name}`)
      .setDescription(
        crowns
          .map((c) => `${c.artistName.bold()} ― yoinked ${ago(c.lastStolen)}`)
          .join("\n")
      );

    await this.send(embed);
  }
}
