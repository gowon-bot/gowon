import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    plays: { index: 0, default: 100, number: true },
  },
  mentions: standardMentions,
} as const;

export default class ArtistPlaysequal extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan sejeong";

  aliases = ["pe", "ape"];
  description =
    "Shows you how many artists you have equal to a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  arguments: Arguments = args;

  async run() {
    let plays = this.parsedArguments.plays!;

    let { username, perspective } = await this.parseMentions();

    let topArtists = await this.lastFMService.topArtists({
      username,
      limit: 1000,
    });

    let playsequal = 0;

    for (let artist of topArtists.artists) {
      if (artist.userPlaycount === plays) playsequal++;
      if (artist.userPlaycount < plays) break;
    }

    await this.traditionalReply(
      `${numberDisplay(playsequal).strong()} of ${
        perspective.possessive
      } top 1,000 artists have exactly ${numberDisplay(plays, "play").strong()}`
    );
  }
}
