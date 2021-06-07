import { OverviewChildCommand } from "./OverviewChildCommand";

export class HIndex extends OverviewChildCommand {
  idSeed = "snsd hyoyeon";

  aliases = ["hidx", "hdx"];
  description =
    "Your hindex is the point where the number of plays you have of an artist at least matches its rank.\n" +
    "For example, if your 56th ranked artist had at least 56 plays, but your 57th ranked artist has under 57, your hindex would be 56.\n" +
    "Hindex is meant to quantify how many different artists you actively listen to.";

  async run() {
    let { perspective } = await this.parseMentions();

    let hindex = await this.calculator.hIndex();

    let embed = (await this.overviewEmbed()).setDescription(
      `${perspective.upper.possessive} H-index is ${hindex.asString.strong()}!`
    );

    await this.send(embed);
  }
}
