import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    plays: { index: 0, default: 100, number: true },
  },
  mentions: standardMentions,
} as const;

export default class TrackPlaysover extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan mina";

  aliases = ["trpo", "tpo"];
  description = "Shows you how many tracks you have over a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  arguments: Arguments = args;

  async run() {
    let plays = this.parsedArguments.plays!;

    let { requestable, perspective } = await this.parseMentions();

    let topTracks = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    let playsover = 0;

    for (let track of topTracks.tracks) {
      if (track.userPlaycount >= plays) playsover++;
      else break;
    }

    await this.traditionalReply(
      `${displayNumber(playsover).strong()} of ${
        perspective.possessive
      } top 1,000 tracks have at least ${displayNumber(plays, "play").strong()}`
    );
  }
}
