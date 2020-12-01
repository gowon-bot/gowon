import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class ArtistPlaysequal extends LastFMBaseCommand {
  aliases = ["pe", "ape"];
  description =
    "Shows you how many artists you have equal to a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  arguments: Arguments = {
    inputs: {
      plays: { index: 0, default: 100, number: true },
    },
    mentions: standardMentions,
  };

  async run() {
    let plays = this.parsedArguments.plays as number;

    let { username, perspective } = await this.parseMentions();

    let topArtists = await this.lastFMService.topArtists({
      username,
      limit: 1000,
    });

    let playsequal = 0;

    for (let artist of topArtists.artist) {
      if (artist.playcount.toInt() === plays) playsequal++;
      if (artist.playcount.toInt() < plays) break;
    }

    await this.reply(
      `${numberDisplay(playsequal).strong()} of ${
        perspective.possessive
      } top 1,000 artists have exactly ${numberDisplay(plays, "play").strong()}`
    );
  }
}
