import { LogicError } from "../../../errors/errors";
import { bold } from "../../../helpers/discord";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/views/displays";
import { ProfileChildCommand } from "./ProfileChildCommand";

const args = {
  timePeriod: new TimePeriodArgument({
    description: "The time period to display stats for",
  }),
  top: new NumberArgument({
    default: 10,
    description: "The number of artists to total",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export class SumTop extends ProfileChildCommand<typeof args> {
  idSeed = "twice momo";

  aliases = ["toppct"];
  description =
    "Shows what percent of your scrobbles are made up by your top artists";
  usage = ["", "time_period top", "time_period top @user"];

  arguments = args;

  slashCommand = true;

  async run() {
    const top = this.parsedArguments.top;

    const { perspective } = await this.getMentions();

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

    const embed = (await this.profileEmbed())
      .setHeader("Profile sum top")
      .setDescription(
        `${perspective.upper.possessive} top ${bold(
          displayNumber(top, "artist")
        )} make up ${bold(displayNumber(sumtop.asNumber, "scrobble"))} (${bold(
          sumtoppct.asString
        )}% of ${perspective.possessivePronoun} total scrobbles!)`
      );

    await this.send(embed);
  }
}
