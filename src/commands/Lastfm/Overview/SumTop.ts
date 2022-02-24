import { LogicError } from "../../../errors";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { displayNumber } from "../../../lib/views/displays";
import { OverviewChildCommand } from "./OverviewChildCommand";

const args = {
  ...standardMentions,
  timePeriod: new TimePeriodArgument(),
  top: new NumberArgument({ default: 10 }),
} as const;

export class SumTop extends OverviewChildCommand<typeof args> {
  idSeed = "twice momo";

  aliases = ["toppct"];
  description =
    "Shows what percent of your scrobbles are made up by your top artists";
  usage = ["", "time_period top", "time_period top @user"];

  arguments = args;

  async run() {
    let top = this.parsedArguments.top!;

    let { perspective } = await this.getMentions();

    if (top > 1000 || top < 2)
      throw new LogicError("Please enter a valid number (between 2 and 1000)");

    // Cache the top artists and user info responses
    await Promise.all([
      this.calculator.topArtists(),
      this.calculator.userInfo(),
    ]);

    const [sumtop, sumtoppct] = await Promise.all([
      this.calculator.sumTop(top),
      this.calculator.sumTopPercent(top),
    ]);

    let embed = (await this.overviewEmbed()).setDescription(
      `${perspective.upper.possessive} top ${displayNumber(
        top,
        "artist"
      ).strong()} make up ${displayNumber(
        sumtop.asNumber,
        "scrobble"
      ).strong()} (${sumtoppct.asString.strong()}% of ${
        perspective.possessivePronoun
      } total scrobbles!)`
    );

    await this.send(embed);
  }
}
