import { OverviewChildCommand, overviewInputs } from "./OverviewChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  mentions: standardMentions,
  inputs: {
    top: {
      index: 0,
      regex: /[0-9]{1,10}(?!\w)(?! [mw])/g,
      default: 10,
      number: true,
    },
    ...overviewInputs,
  },
} as const;

export class SumTop extends OverviewChildCommand<typeof args> {
  idSeed = "twice momo";

  aliases = ["toppct"];
  description =
    "Shows what percent of your scrobbles are made up by your top artists";
  usage = ["", "time_period top", "time_period top @user"];

  arguments: Arguments = args;

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
