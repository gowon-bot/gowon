import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class TrackPlaysover extends LastFMBaseCommand {
  idSeed = "gugudan mina";

  aliases = ["trpo", "tpo"];
  description = "Shows you how many tracks you have over a certain playcount";
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

    let topTracks = await this.lastFMService.topTracks({
      username,
      limit: 1000,
    });

    let playsover = 0;

    for (let track of topTracks.track) {
      if (track.playcount.toInt() >= plays) playsover++;
      else break;
    }

    await this.reply(
      `${numberDisplay(playsover).strong()} of ${
        perspective.possessive
      } top 1,000 tracks have at least ${numberDisplay(plays, "play").strong()}`
    );
  }
}
