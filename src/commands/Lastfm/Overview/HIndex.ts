import { bold } from "../../../helpers/discord";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class HIndex extends OverviewChildCommand {
  idSeed = "snsd hyoyeon";

  slashCommand = true;

  aliases = ["hidx", "hdx"];
  description =
    "Your hindex is the point where the number of plays you have of an artist at least matches its rank.";
  extraDescription =
    "\nFor example, if your 56th ranked artist had at least 56 plays, but your 57th ranked artist has under 57, your hindex would be 56.\n" +
    "Hindex is meant to quantify how many different artists you actively listen to.";

  async run() {
    const { perspective } = await this.getMentions();

    const hindex = await this.calculator.hIndex();

    const embed = (await this.overviewEmbed()).setDescription(
      `${perspective.upper.possessive} H-index is ${bold(hindex.asString)}!`
    );

    await this.send(embed);
  }
}
