import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";

export class TopCrowns extends CrownsChildCommand {
  description = "Lists the top crowns in the server";
  aliases = ["top"];

  async run(message: Message) {
    let [crowns, crownsCount] = await Promise.all([
      this.crownsService.listTopCrownsInServer(message.guild?.id!),
      this.crownsService.countAllInServer(message.guild?.id!),
    ]);

    let embed = new MessageEmbed()
      .setTitle(`Top crowns in ${message.guild?.name}`)
      .setDescription(
        `There are **${numberDisplay(crownsCount, "** crown")} in ${
          message.guild?.name
        }\n\n` +
          crowns
            .map(
              (c) => `${c.artistName} ― **${numberDisplay(c.plays, "play")}**`
            )
            .join("\n")
      );

    await message.channel.send(embed);
  }
}
