import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay, ucFirst } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class TrackPlays extends LastFMBaseCommand {
  aliases = ["tp"];
  description = "Shows you how many plays you have of a given track";
  subcategory = "plays";
  usage = ["artist | track @user"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  async run() {
    let artist = this.parsedArguments.artist as string,
      track = this.parsedArguments.track as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername();

    if (!artist || !track) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    let hamham =
      artist.toLowerCase() === "iu" && track.toLowerCase() === "ham ham";
    if (hamham) track = "Jam Jam";

    let trackDetails = await this.lastFMService.trackInfo({
      artist,
      track,
      username,
    });

    this.send(
      `${hamham ? "FTFY\n" : ""}${ucFirst(
        perspective.plusToHave
      )} **${numberDisplay(trackDetails.userplaycount, "**scrobble")} of **${
        trackDetails.name
      }** by ${trackDetails.artist.name}`
    );
  }
}
