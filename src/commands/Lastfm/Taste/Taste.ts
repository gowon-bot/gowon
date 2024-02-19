import { LogicError } from "../../../errors/errors";
import { code } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { constants } from "../../../lib/constants";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { DateRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/DateRangeArgument";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers/humanize";
import { displayLink, displayNumber } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { TasteService } from "../../../services/taste/TasteService";
import { TasteCommand, tasteArgs } from "./TasteCommand";

const args = {
  ...tasteArgs,
  timePeriod: new TimePeriodArgument({
    default: "overall",
    description: "The time period to compare",
  }),
  dateRange: new DateRangeArgument({
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
      LastfmLinks.userPage(userOneUsername)
    )} and ${displayLink(
      userTwoUsername,
      LastfmLinks.userPage(userTwoUsername)
    )} ${
      this.dateRange?.humanized() || humanizedPeriod
    }**\n\n${percentageMatch}`;

    const embed = this.minimalEmbed().setDescription(embedDescription);

    const scrollingEmbed = new ScrollingListView(this.ctx, embed, {
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

    await this.reply(scrollingEmbed);
  }
}
