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

export default class TrackPlaysequal extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan soyee";

  aliases = ["trpe", "tpe"];
  description =
    "Shows you how many tracks you have equal to a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  arguments: Arguments = args;

  async run() {
    let plays = this.parsedArguments.plays!;

    let { requestable, perspective } = await this.getMentions();

    let topTracks = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    let playsequal = 0;

    for (let track of topTracks.tracks) {
      if (track.userPlaycount >= plays) playsequal++;
      if (track.userPlaycount < plays) break;
    }

    await this.traditionalReply(
      `${displayNumber(playsequal).strong()} of ${
        perspective.possessive
      } top 1,000 tracks have exactly ${displayNumber(plays, "play").strong()}`
    );
  }
}
