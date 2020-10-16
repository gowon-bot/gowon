import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class TrackPlaysover extends LastFMBaseCommand {
  aliases = ["trpo", "tpo"];
  description = "Shows you how many artists you have over a certain playcount";
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

    let playsover = 0;

    for (let album of topArtists.artist) {
      if (album.playcount.toInt() >= plays) playsover++;
      else break;
    }

    await this.reply(
      `${numberDisplay(playsover).bold()} of ${
        perspective.possessive
      } top 1,000 artists have at least ${numberDisplay(plays, "play").bold()}`
    );
  }
}
