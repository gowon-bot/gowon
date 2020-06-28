import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message, MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";

export class Crowns extends CrownsChildCommand {
  aliases = ["crowns"];
  description = "Lists your top crowns";

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    let crowns = await this.crownsService.listTopCrowns(message.author.id);
    let crownsCount = await this.crownsService.count(message.author.id);

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
