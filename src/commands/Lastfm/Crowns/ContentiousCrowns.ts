import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";
import { LogicError } from "../../../errors";
import { displayNumber } from "../../../lib/views/displays";

export class ContentiousCrowns extends CrownsChildCommand {
  idSeed = "weki meki yoojung";

  description =
    "Lists the most contentious crowns in the server (ones that have been stolen the most number of times)";
  aliases = ["cont", "contentious", "con"];
  usage = "";

  async run(message: Message) {
    const serverUsers = await this.serverUserIDs({
      filterCrownBannedUsers: true,
    });

    const [crowns, crownsCount] = await Promise.all([
      this.crownsService.listContentiousCrownsInServer(
        this.ctx,
        message.guild?.id!,
        undefined,
        serverUsers
      ),
      this.crownsService.countAllInServer(
        this.ctx,
        message.guild?.id!,
        serverUsers
      ),
    ]);

    const filteredCrowns = crowns.filter((c) => c.version > 0);

    if (!filteredCrowns.length)
      throw new LogicError("no crowns have been stolen yet!");

    const embed = this.newEmbed()
      .setTitle(`Most contentious crowns in ${message.guild?.name}`)
      .setDescription(
        `There are **${displayNumber(crownsCount, "** crown")} in ${
          message.guild?.name
        }\n\n` +
          filteredCrowns
            .map(
              (c) =>
                `${c.artistName} ― stolen ${displayNumber(
                  c.version,
                  "time"
                ).strong()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
