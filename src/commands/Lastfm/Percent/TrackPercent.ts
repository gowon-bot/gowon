import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class TrackPercent extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy yeji";

  aliases = ["tpct"];
  description =
    "Shows you what percentage of an artist's scrobbles are made up by a certain track";
  subcategory = "percents";
  usage = ["artist | track"];

  arguments: Arguments = args;

  async run() {
    let artist = this.parsedArguments.artist,
      track = this.parsedArguments.track;

    let { username, senderUsername, perspective } = await this.parseMentions({
      senderRequired: !artist || !track,
    });

    if (!artist || !track) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    let [artistInfo, trackInfo] = await Promise.all([
      this.lastFMService.artistInfo({ artist, username }),
      this.lastFMService.trackInfo({ artist, track, username }),
    ]);

    await this.reply(
      `${perspective.possessive} ${numberDisplay(
        trackInfo.userplaycount,
        "play"
      )} of ${trackInfo.name.strong()} represent ${calculatePercent(
        trackInfo.userplaycount,
        artistInfo.stats.userplaycount
      ).strong()}% of ${
        perspective.possessivePronoun
      } ${artistInfo.name.strong()} scrobbles`
    );
  }
}
