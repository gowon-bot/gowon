import { OverviewChildCommand } from "./OverviewChildCommand";

export class HIndex extends OverviewChildCommand {
  aliases = ["hidx", "hdx"];
  description = "Shows your H-index (!hindex for more information)";

  async run() {
    let { username, perspective } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();
    let hindex = await this.calculator.hIndex();

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `${perspective.upper.possessive} H-index is ${hindex.asString.bold()}!`
      );

    await this.send(embed);
  }
}
