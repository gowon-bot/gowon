import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";

const args = {
  ...standardMentions,
  plays: new NumberArgument({ default: 100 }),
} as const;

export default class ArtistPlaysequal extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan sejeong";

  aliases = ["pe", "ape"];
  description =
    "Shows you how many artists you have equal to a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  arguments = args;

  async run() {
    let plays = this.parsedArguments.plays!;

    let { requestable, perspective } = await this.getMentions();

    let topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    let playsequal = 0;

    for (let artist of topArtists.artists) {
      if (artist.userPlaycount === plays) playsequal++;
      if (artist.userPlaycount < plays) break;
    }

    await this.traditionalReply(
      `${displayNumber(playsequal).strong()} of ${
        perspective.possessive
      } top 1,000 artists have exactly ${displayNumber(plays, "play").strong()}`
    );
  }
}
