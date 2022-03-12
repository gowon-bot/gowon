import { CrownsChildCommand } from "./CrownsChildCommand";
import { LogicError } from "../../../errors/errors";
import { displayNumber } from "../../../lib/views/displays";

export class ContentiousCrowns extends CrownsChildCommand {
  idSeed = "weki meki yoojung";

  description =
    "Lists the crowns that have been stolen the most number of times";
  aliases = ["cont", "contentious", "con"];
  usage = "";

  slashCommand = true;

  async run() {
    const serverUsers = await this.serverUserIDs({
      filterCrownBannedUsers: true,
    });

    const [crowns, crownsCount] = await Promise.all([
      this.crownsService.listContentiousCrownsInServer(
        this.ctx,
        undefined,
        serverUsers
      ),
      this.crownsService.countAllInServer(this.ctx, serverUsers),
    ]);

    const filteredCrowns = crowns.filter((c) => c.version > 0);

    if (!filteredCrowns.length)
      throw new LogicError("no crowns have been stolen yet!");

    const embed = this.newEmbed()
      .setTitle(`Most contentious crowns in ${this.requiredGuild.name}`)
      .setDescription(
        `There are **${displayNumber(crownsCount, "** crown")} in ${
          this.requiredGuild.name
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
