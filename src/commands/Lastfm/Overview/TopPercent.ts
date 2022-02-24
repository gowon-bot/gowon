import { OverviewChildCommand } from "./OverviewChildCommand";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";

const args = {
  ...standardMentions,
  timePeriod: new TimePeriodArgument(),
  percent: new NumberArgument({ default: 50 }),
} as const;

export class TopPercent extends OverviewChildCommand<typeof args> {
  idSeed = "twice sana";

  aliases = ["toppct", "apct"];
  description = "Shows how many artists make up at least 50% of your scrobbles";
  usage = ["", "time_period percent", "time_period percent @user"];

  arguments = args;

  validation: Validation = {
    percent: new validators.Range({ min: 5, max: 100 }),
  };

  async run() {
    let percent = this.parsedArguments.percent!;

    let { perspective } = await this.getMentions();

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
