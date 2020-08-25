import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";

export class ContentiousCrowns extends CrownsChildCommand {
  description = "Lists the most contentious crowns in the server";
  aliases = ["cont", "contentious", "con"];
  usage = ""

  async run(message: Message) {
    let [crowns, crownsCount] = await Promise.all([
      this.crownsService.listContentiousCrownsInServer(message.guild?.id!),
      this.crownsService.countAllInServer(message.guild?.id!),
    ]);

    let embed = new MessageEmbed()
      .setTitle(`Most contentious crowns in ${message.guild?.name}`)
      .setDescription(
        `There are **${numberDisplay(crownsCount, "** crown")} in ${
          message.guild?.name
        }\n\n` +
          crowns
            .map(
              (c) =>
                `${c.artistName} ― stolen ${numberDisplay(
                  c.version - 1,
                  "time"
                ).bold()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
