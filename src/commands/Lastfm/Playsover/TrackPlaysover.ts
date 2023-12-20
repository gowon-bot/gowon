import { bold } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/ui/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  plays: new NumberArgument({
    default: 100,
    description: "The number of plays to check for",
  }),
} satisfies ArgumentsMap;

export default class TrackPlaysover extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan mina";

  aliases = ["trpo", "tpo"];
  description = "Shows you how many tracks you have over a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];
  slashCommand = true;

  variations: Variation[] = [
    {
      name: "equal",
      description: "Shows plays equal",
      variation: ["trackplaysequal", "tpe", "trpe"],
    },
  ];

  arguments = args;

  async run() {
    const { requestable, perspective } = await this.getMentions();

    const plays = this.parsedArguments.plays;
    const equal = this.variationWasUsed("equal");

    const topTracks = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    const playsover = topTracks.tracks.reduce(
      (acc, t) =>
        acc +
        ((equal ? t.userPlaycount === plays : t.userPlaycount >= plays)
          ? 1
          : 0),
      0
    );

    const embed = this.authorEmbed()
      .setAuthor(
        this.generateEmbedAuthor(`Track plays${equal ? "equal" : "over"}`)
      )
      .setDescription(
        `${bold(displayNumber(playsover))} of ${
          perspective.possessive
        } top ${displayNumber(topTracks.tracks.length, "track")} have ${
          equal ? "" : "at least "
        }${bold(displayNumber(plays, "play"))}`
      );

    await this.send(embed);
  }
}
