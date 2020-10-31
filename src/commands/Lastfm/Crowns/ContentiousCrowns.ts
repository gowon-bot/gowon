import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";
import { numberDisplay } from "../../../helpers";
import { LogicError } from "../../../errors";

export class ContentiousCrowns extends CrownsChildCommand {
  description = "Lists the most contentious crowns in the server";
  aliases = ["cont", "contentious", "con"];
  usage = "";

  async run(message: Message) {
    let [crowns, crownsCount] = await Promise.all([
      this.crownsService.listContentiousCrownsInServer(message.guild?.id!),
      this.crownsService.countAllInServer(message.guild?.id!),
    ]);

    let filteredCrowns = crowns.filter((c) => c.version > 0);

    if (!filteredCrowns.length)
      throw new LogicError("no crowns have been stolen yet!");

    let embed = this.newEmbed()
      .setTitle(`Most contentious crowns in ${message.guild?.name}`)
      .setDescription(
        `There are **${numberDisplay(crownsCount, "** crown")} in ${
          message.guild?.name
        }\n\n` +
          filteredCrowns
            .map(
              (c) =>
                `${c.artistName} ― stolen ${numberDisplay(
                  c.version,
                  "time"
                ).bold()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
