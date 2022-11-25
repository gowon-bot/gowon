import { TasteCalculator } from "../../../lib/calculators/TasteCalculator";
import { Variation } from "../../../lib/command/Command";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LogicError } from "../../../errors/errors";
import { TasteCommand, tasteArgs } from "./TasteCommand";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { displayLink, displayNumber } from "../../../lib/views/displays";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers/humanize";
import { LinkGenerator } from "../../../helpers/lastFM";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { TimeRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimeRangeArgument";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { code } from "../../../helpers/discord";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

const args = {
  ...tasteArgs,
  timePeriod: new TimePeriodArgument({
    default: "overall",
    description: "The time period to compare",
  }),
  timeRange: new TimeRangeArgument({
    description: "The time range to compare",
  }),
  artistAmount: new NumberArgument({
    default: 1000,
    description: "The amount of artists to compare",
  }),
  username: new StringArgument({
    index: 0,
    description: "The Last.fm username to compare to",
  }),
  username2: new StringArgument({
    index: 1,
    description: "The other Last.fm username to compare (defaults to you)",
  }),
} satisfies ArgumentsMap

export default class Taste extends TasteCommand<typeof args> {
  idSeed = "secret number jinny";
  aliases = ["t", "tb"];
  description = "Shows your taste overlap with another user";
  usage = [
    "",
    "@user or lfm:username",
    "time period @user",
    "username time period amount ",
  ];

  variations: Variation[] = [
    {
      name: "embed",
      variation: "te",
      description:
        "Uses an embed view instead of a table to display (more mobile friendly)",
    },
  ];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    artistAmount: {
      validator: new validators.RangeValidator({ min: 100, max: 2000 }),
      friendlyName: "amount",
    },
  };

  async run() {
    const artistAmount = this.parsedArguments.artistAmount;
    const humanizedPeriod = humanizePeriod(this.parsedArguments.timePeriod);

    const [userOneUsername, userTwoUsername] = await this.getUsernames();

    const [senderPaginator, mentionedPaginator] = this.getPaginators(
      userOneUsername,
      userTwoUsername
    );

    const [senderArtists, mentionedArtists] = await Promise.all([
      senderPaginator.getAllToConcatonable(),
      mentionedPaginator.getAllToConcatonable(),
    ]);

    const tasteCalculator = new TasteCalculator(
      senderArtists.artists,
      mentionedArtists.artists,
      artistAmount
    );

    const taste = tasteCalculator.calculate();

    if (taste.artists.length === 0) {
      throw new LogicError(
        `${code(userOneUsername)} and ${code(
          userTwoUsername
        )} share no common artists!`
      );
    }

    const percentageMatch =
      userOneUsername === userTwoUsername
        ? "It's 100%, what are you expecting :neutral_face:"
        : `Comparing top ${displayNumber(
          senderArtists.artists.slice(0, artistAmount).length,
          "artist"
        )}, ${displayNumber(taste.artists.length, "overlapping artist")} (${taste.percent
        }% match) found.`;

    const embedDescription = `**Comparison for ${displayLink(
      userOneUsername,
      LinkGenerator.userPage(userOneUsername)
    )} and ${displayLink(
      userTwoUsername,
      LinkGenerator.userPage(userTwoUsername)
    )} ${this.timeRange?.humanized || humanizedPeriod}**\n\n${percentageMatch}`;

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Taste"))
      .setDescription(embedDescription);

    if (this.variationWasUsed("embed")) {
      this.generateEmbed(taste, embed);
      await this.send(embed);
    } else {
      const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
        items: taste.artists,
        pageSize: 20,
        pageRenderer: (items) => {
          return (
            embedDescription +
            "\n" +
            this.generateTable(userOneUsername, userTwoUsername, items)
          );
        },
      });

      scrollingEmbed.send();
    }
  }
}
