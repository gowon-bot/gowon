import { OverviewChildCommand } from "./OverviewChildCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  mentions: standardMentions,
  inputs: {
    percent: { regex: /[0-9]+/, index: 0, default: 50, number: true },
  },
} as const;

export class TopPercent extends OverviewChildCommand<typeof args> {
  idSeed = "twice sana";

  aliases = ["toppct", "apct"];
  description = "Shows how many artists make up at least 50% of your scrobbles";

  arguments: Arguments = args;

  validation: Validation = {
    percent: new validators.Range({ min: 5, max: 100 }),
  };

  async run() {
    let percent = this.parsedArguments.percent!;

    let { username, perspective } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();

    let toppct = await this.calculator.topPercent(percent);

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `${toppct.count.asString.strong()} artists (a total of ${numberDisplay(
          toppct.total.asNumber,
          "scrobble"
        )}) make up ${percent}% of ${perspective.possessive} scrobbles!`
      );

    await this.send(embed);
  }
}
