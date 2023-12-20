import { NoContentiousCrownsError } from "../../../errors/commands/crowns";
import { bold } from "../../../helpers/discord";
import { displayNumber } from "../../../lib/views/displays";
import { CrownsChildCommand } from "./CrownsChildCommand";

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

    const [contentiousCrowns, crownsCount] = await Promise.all([
      this.crownsService.listContentiousCrownsInServer(
        this.ctx,
        undefined,
        serverUsers
      ),
      this.crownsService.countAllInServer(this.ctx, serverUsers),
    ]);

    if (!contentiousCrowns.length) {
      throw new NoContentiousCrownsError();
    }

    const embed = this.authorEmbed()
      .setHeader("Contentious crowns")
      .setTitle(`Most contentious crowns in ${this.requiredGuild.name}`)
      .setDescription(
        `There are **${displayNumber(crownsCount, "** crown")} in ${
          this.requiredGuild.name
        }\n\n` +
          contentiousCrowns
            .map(
              (c) =>
                `${c.artistName} ― stolen ${bold(
                  displayNumber(c.version, "time")
                )}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
