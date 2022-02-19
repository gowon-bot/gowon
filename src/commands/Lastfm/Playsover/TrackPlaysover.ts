import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";

const args = {
  ...standardMentions,
  plays: new NumberArgument({ default: 100 }),
} as const;

export default class TrackPlaysover extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan mina";

  aliases = ["trpo", "tpo"];
  description = "Shows you how many tracks you have over a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  arguments = args;

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
