import { bold } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/ui/displays";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  plays: new NumberArgument({
    default: 100,
    description: "The number of plays to check for",
  }),
} satisfies ArgumentsMap;

export default class ArtistPlaysover extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan sally";

  aliases = ["po", "apo"];
  description = "Shows you how many artists you have over a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];
  slashCommand = true;

  variations: Variation[] = [
    {
      name: "equal",
      description: "Shows plays equal",
      variation: ["artistplaysequal", "playsequal", "pe", "ape"],
    },
  ];

  arguments = args;

  validation: Validation = {
    plays: validators.positiveNumberValidator,
  };

  async run() {
    const { requestable, perspective } = await this.getMentions();

    const plays = this.parsedArguments.plays;
    const equal = this.variationWasUsed("equal");

    const topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    const playsover = topArtists.artists.reduce(
      (acc, a) =>
        acc +
        ((equal ? a.userPlaycount === plays : a.userPlaycount >= plays)
          ? 1
          : 0),
      0
    );

    const embed = this.minimalEmbed().setDescription(
      `${bold(displayNumber(playsover))} of ${
        perspective.possessive
      } top ${displayNumber(topArtists.artists.length, "artist")} have ${
        equal ? "" : "at least "
      }${bold(displayNumber(plays, "play"))}`
    );

    await this.reply(embed);
  }
}
