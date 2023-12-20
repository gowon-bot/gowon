import { bold } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayNumber } from "../../../lib/views/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  plays: new NumberArgument({
    default: 100,
    description: "The number of plays to check for",
  }),
} satisfies ArgumentsMap;

export default class AlbumPlaysover extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan nayoung";

  aliases = ["alpo", "lpo"];
  description = "Shows you how many albums you have over a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];
  slashCommand = true;

  variations: Variation[] = [
    {
      name: "equal",
      description: "Shows plays equal",
      variation: ["albumplaysequal", "lpe", "alpe"],
    },
  ];

  validation: Validation = {
    plays: validators.positiveNumberValidator,
  };

  arguments = args;

  async run() {
    const { requestable, perspective } = await this.getMentions();

    const plays = this.parsedArguments.plays;
    const equal = this.variationWasUsed("equal");

    const topAlbums = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    const playsover = topAlbums.albums.reduce(
      (acc, l) =>
        acc +
        ((equal ? l.userPlaycount === plays : l.userPlaycount >= plays)
          ? 1
          : 0),
      0
    );

    const embed = this.authorEmbed()
      .setAuthor(
        this.generateEmbedAuthor(`Album plays${equal ? "equal" : "over"}`)
      )
      .setDescription(
        `${bold(displayNumber(playsover))} of ${
          perspective.possessive
        } top ${displayNumber(topAlbums.albums.length, "album")} have ${
          equal ? "" : "at least "
        }${bold(displayNumber(plays, "play"))}`
      );

    await this.send(embed);
  }
}
