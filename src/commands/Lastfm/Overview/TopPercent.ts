import { OverviewChildCommand, overviewInputs } from "./OverviewChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  mentions: standardMentions,
  inputs: {
    percent: {
      regex: /[0-9]{1,3}(?!\w)(?! [mw])/g,
      index: 0,
      default: 50,
      number: true,
    },
    ...overviewInputs,
  },
} as const;

export class TopPercent extends OverviewChildCommand<typeof args> {
  idSeed = "twice sana";

  aliases = ["toppct", "apct"];
  description = "Shows how many artists make up at least 50% of your scrobbles";
  usage = ["", "time_period percent", "time_period percent @user"];

  arguments: Arguments = args;

  validation: Validation = {
    percent: new validators.Range({ min: 5, max: 100 }),
  };

  async run() {
    let percent = this.parsedArguments.percent!;

    let { perspective } = await this.parseMentions();

    let toppct = await this.calculator.topPercent(percent);

    let embed = (await this.overviewEmbed()).setDescription(
      `${toppct.count.asString.strong()} artists (a total of ${displayNumber(
        toppct.total.asNumber,
        "scrobble"
      )}) make up ${percent}% of ${perspective.possessive} scrobbles!`
    );

    await this.send(embed);
  }
}
