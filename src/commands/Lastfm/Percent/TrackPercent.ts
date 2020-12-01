import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class TrackPercent extends LastFMBaseCommand {
  aliases = ["tpct"];
  description =
    "Shows you what percentage of an artist's scrobbles are made up by a certain track";
  subcategory = "percents";
  usage = ["artist | track"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
    mentions: standardMentions,
  };

  async run() {
    let artist = this.parsedArguments.artist as string,
      track = this.parsedArguments.track as string;

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
