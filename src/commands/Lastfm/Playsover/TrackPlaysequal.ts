import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class TrackPlaysequal extends LastFMBaseCommand {
  aliases = ["trpe", "tpe"];
  description =
    "Shows you how many tracks you have equal to a certain playcount";
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

    let playsequal = 0;

    for (let track of topTracks.track) {
      if (track.playcount.toInt() >= plays) playsequal++;
      if (track.playcount.toInt() < plays) break;
    }

    await this.reply(
      `${numberDisplay(playsequal).strong()} of ${
        perspective.possessive
      } top 1,000 tracks have exactly ${numberDisplay(plays, "play").strong()}`
    );
  }
}
