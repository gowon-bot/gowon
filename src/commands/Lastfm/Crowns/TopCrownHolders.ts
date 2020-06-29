import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";

export class TopCrownHolders extends CrownsChildCommand {
  description = "Lists the top crown holders in the server";
  aliases = ["leaderboard", "ldb"];

  async run(message: Message) {
    let [holders, crownsCount] = await Promise.all([
      this.crownsService.topCrownHolders(message.guild?.id!, message, 20),
      this.crownsService.countAllInServer(message.guild?.id!),
    ]);

    let embed = new MessageEmbed()
      .setTitle(`Crowns in ${message.guild?.name}`)
      .setDescription(
        `There are **${numberDisplay(crownsCount, "** crown")} in ${
          message.guild?.name
        }\n\n` +
          holders
            .map(
              (h, idx) =>
                `${idx}) ${h.user.username} ― **${numberDisplay(
                  h.numberOfCrowns,
                  "crown"
                )}**`
            )
            .join("\n")
      );

    await message.channel.send(embed);
  }
}
