import { numberDisplay } from "../../../helpers";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class Playsover extends OverviewChildCommand {
  aliases = ["po"];
  description = "Shows some playsover stats";

  async run() {
    let { username, perspective } = await this.parseMentions();

    // Cache the top artists response
    await this.calculator.topArtists()

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
  - ${thousand.asString.bold()} artists with 1000+ scrobbles
  - ${fivehundred.asString.bold()} artists with 500+ scrobbles
  - ${twofifty.asString.bold()} artists with 250+ scrobbles
  - ${hundred.asString.bold()} artists with 100+ scrobbles
  - ${fifty.asString.bold()} artists with 50+ scrobbles`);

    await this.send(embed);
  }
}
