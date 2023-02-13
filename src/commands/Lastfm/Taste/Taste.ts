import { LogicError } from "../../../errors/errors";
import { code } from "../../../helpers/discord";
import { LinkGenerator } from "../../../helpers/lastFM";
import { Variation } from "../../../lib/command/Command";
import { constants } from "../../../lib/constants";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { TimeRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimeRangeArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers/humanize";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayLink, displayNumber } from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { TasteService } from "../../../services/taste/TasteService";
import { tasteArgs, TasteCommand } from "./TasteCommand";

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
    default: constants.defaultTasteAmount,
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
} satisfies ArgumentsMap;

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

  tasteService = ServiceRegistry.get(TasteService);

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

    const tasteMatch = this.tasteService.artistTaste(
      senderArtists.artists,
      mentionedArtists.artists,
      artistAmount
    );

    if (tasteMatch.artists.length === 0) {
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
          )}, ${displayNumber(
            tasteMatch.artists.length,
            "overlapping artist"
          )}\n_${
            tasteMatch.percent
          }% match found (${this.tasteService.compatibility(
            tasteMatch.percent
          )})_`;

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
      this.generateEmbed(tasteMatch, embed);
      await this.send(embed);
    } else {
      const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
        items: tasteMatch.artists,
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
