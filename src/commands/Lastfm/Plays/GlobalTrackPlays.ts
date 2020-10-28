import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { calculatePercent } from "../../../helpers/stats";

export default class GlobalTrackPlays extends LastFMBaseCommand {
  aliases = ["gtp", "globaltp"];
  description = "Shows you how many plays Last.fm has of a given track";
  subcategory = "plays";
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

    let { username, perspective, senderUsername } = await this.parseMentions({
      senderRequired: !artist || !track,
    });

    if (!artist || !track) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    let trackDetails = await this.lastFMService.trackInfo({
      artist,
      track,
      username,
    });

    let percentage = calculatePercent(
      trackDetails.userplaycount,
      trackDetails.playcount
    );

    this.send(
      `Last.fm has scrobbled **${trackDetails.name}** by ${
        trackDetails.artist.name
      } ${numberDisplay(trackDetails.playcount, "time")}${
        trackDetails.userplaycount.toInt() > 0
          ? `. ${perspective.upper.plusToHave} ${numberDisplay(
              trackDetails.userplaycount,
              "scrobble"
            )}${parseFloat(percentage) > 0 ? ` (${percentage}%)` : ""}`
          : ""
      }`
    );
  }
}
