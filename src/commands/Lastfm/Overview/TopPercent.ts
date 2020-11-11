import { OverviewChildCommand } from "./OverviewChildCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

export class TopPercent extends OverviewChildCommand {
  aliases = ["toppct"];
  description = "Shows how many artists make up at least 50% of your scrobbles";

  arguments: Arguments = {
    inputs: {
      percent: { regex: /[0-9]+/, index: 0, default: 50, number: true },
    },
  };

  validation: Validation = {
    percent: new validators.Range({ min: 5, max: 100 }),
  };

  async run() {
    let percent = this.parsedArguments.percent as number;

    let { username, perspective } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();

    let toppct = await this.calculator.topPercent(percent);

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `${toppct.count.asString.bold()} artists (a total of ${numberDisplay(
          toppct.total.asNumber,
          "scrobble"
        )}) make up ${percent}% of ${perspective.possessive} scrobbles!`
      );

    await this.send(embed);
  }
}
