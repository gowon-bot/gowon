import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { ago } from "../../../helpers";

export class RecentlyStolen extends CrownsChildCommand {
  description = "Lists the crowns that were most recently stolen";
  aliases = ["recent", "stolen", "rs"];

  async run(message: Message) {
    let crowns = await this.crownsService.listRecentlyStolen(
      message.guild?.id!
    );

    let embed = new MessageEmbed()
      .setTitle(`Recently stolen crowns in ${message.guild?.name}`)
      .setDescription(
        crowns
          .map((c) => `${c.artistName.bold()} ― yoinked ${ago(c.lastStolen)}`)
          .join("\n")
      );

    await message.channel.send(embed);
  }
}
