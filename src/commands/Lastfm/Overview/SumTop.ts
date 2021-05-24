import { OverviewChildCommand } from "./OverviewChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  mentions: standardMentions,
  inputs: {
    top: { index: 0, regex: /[0-9]{1,4}/, default: 10, number: true },
  },
} as const;

export class SumTop extends OverviewChildCommand<typeof args> {
  idSeed = "twice momo";

  aliases = ["toppct"];
  description =
    "Shows what percent of your scrobbles are made up by your top artists";
  usage = ["", "top", "top @user"];

  arguments: Arguments = args;

  async run() {
    let top = this.parsedArguments.top!;

    let { username, perspective } = await this.parseMentions();

    if (top > 1000 || top < 2)
      throw new LogicError("Please enter a valid number (between 2 and 1000)");

    // Cache the top artists and user info responses
    await Promise.all([
      this.calculator.topArtists(),
      this.calculator.userInfo(),
    ]);

    let { badge, colour, image } = await this.getAuthorDetails();
    let [sumtop, sumtoppct] = await Promise.all([
      this.calculator.sumTop(top),
      this.calculator.sumTopPercent(top),
    ]);

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
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
