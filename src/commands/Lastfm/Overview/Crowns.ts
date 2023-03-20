import { UserHasNoCrownsInServerError } from "../../../errors/crowns";
import { LogicError } from "../../../errors/errors";
import { getOrdinal } from "../../../helpers";
import { bold, italic } from "../../../helpers/discord";
import { displayNumber } from "../../../lib/views/displays";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class Crowns extends OverviewChildCommand {
  idSeed = "snsd tiffany";

  aliases = ["cw", "cws"];
  description = "Shows some stats about crowns";

  slashCommand = true;

  async run() {
    const { perspective } = await this.getMentions();

    const [crownRank, apc, spc] = await Promise.all([
      this.calculator.crownsRank(),
      this.calculator.artistsPerCrown(),
      this.calculator.scrobblesPerCrown(),
    ]);

    if (!crownRank?.count) {
      throw new UserHasNoCrownsInServerError(perspective);
    }

    if (await this.calculator.hasCrownStats()) {
      const embed = (await this.overviewEmbed())
        .setDescription(`You have ${bold(
        displayNumber(crownRank!.count, "crown")
      )} (ranked ${italic(getOrdinal(crownRank!.rank))})
        For every ${bold(displayNumber(apc!.asNumber, "eligible artist"))}, ${
        perspective.plusToHave
      } a crown
  For every ${bold(displayNumber(spc!.asNumber, "scrobble"))}, ${
        perspective.plusToHave
      } a crown
        `);

      await this.send(embed);
    } else {
      throw new LogicError(
        "that user isn't logged into the bot or doesn't have any crowns!"
      );
    }
  }
}
