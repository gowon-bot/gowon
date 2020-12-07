import { numberDisplay } from "../../../helpers";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class Playsover extends OverviewChildCommand {
  idSeed = "snsd seohyun";

  aliases = ["po"];
  description =
    "Shows how many artists you have over 1000, 500, 250, 100, and 50 scrobbles respectively";

  async run() {
    let { username, perspective } = await this.parseMentions();

    // Cache the top artists response
    await this.calculator.topArtists();

    let { badge, colour, image } = await this.getAuthorDetails();
    let [
      thousand,
      fivehundred,
      twofifty,
      hundred,
      fifty,
      artistCount,
    ] = await Promise.all([
      this.calculator.playsOver(1000),
      this.calculator.playsOver(500),
      this.calculator.playsOver(250),
      this.calculator.playsOver(100),
      this.calculator.playsOver(50),
      this.calculator.totalArtists(),
    ]);

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour).setDescription(`Among ${
      perspective.possessivePronoun
    } top ${numberDisplay(
      artistCount.asNumber > 1000 ? 1000 : artistCount.asNumber,
      "artist"
    )}, ${perspective.plusToHave}...
  - ${thousand.asString.strong()} artists with 1000+ scrobbles
  - ${fivehundred.asString.strong()} artists with 500+ scrobbles
  - ${twofifty.asString.strong()} artists with 250+ scrobbles
  - ${hundred.asString.strong()} artists with 100+ scrobbles
  - ${fifty.asString.strong()} artists with 50+ scrobbles`);

    await this.send(embed);
  }
}
