import { bold } from "../../../helpers/discord";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/ui/displays";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { ProfileChildCommand } from "./ProfileChildCommand";

const args = {
  timePeriod: new TimePeriodArgument({
    description: "The time period to display stats for",
  }),
  percent: new NumberArgument({
    default: 50,
    description: "The percent of artists to total to (defaults to 50)",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export class TopPercent extends ProfileChildCommand<typeof args> {
  idSeed = "twice sana";

  aliases = ["toppct", "apct"];
  description = "Shows how many artists make up at least 50% of your scrobbles";
  usage = ["", "time_period percent", "time_period percent @user"];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    percent: new validators.RangeValidator({ min: 5, max: 100 }),
  };

  async run() {
    const percent = this.parsedArguments.percent;

    const { perspective } = await this.getMentions();

    const toppct = await this.calculator.topPercent(percent);

    const embed = this.profileEmbed().setDescription(
      `${bold(toppct.count.asString)} artists (a total of ${displayNumber(
        toppct.total.asNumber,
        "scrobble"
      )}) make up ${percent}% of ${perspective.possessive} scrobbles!`
    );

    await this.reply(embed);
  }
}
