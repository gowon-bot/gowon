import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";

export class List extends CrownsChildCommand {
  description = "Lists your top crowns";

  async run(message: Message) {
    let [crowns, crownsCount] = await Promise.all([
      this.crownsService.listTopCrowns(message.author.id),
      this.crownsService.count(message.author.id),
    ]);

    let embed = new MessageEmbed()
      .setTitle(`Your crowns`)
      .setDescription(
        `You have **${numberDisplay(crownsCount, "** crown")} in ${
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
