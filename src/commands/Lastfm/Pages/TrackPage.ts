import { cleanURL } from "../../../helpers/discord";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class TrackPage extends LastFMBaseCommand {
  aliases = ["tpa", "tpage"];
  description = "Links you to the track page on lastfm";
  subcategory = "pages";
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

    let { username } = await this.parseMentions();

    if (!artist || !track) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(username);

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    let trackDetails = await this.lastFMService.trackInfo({
      artist,
      track,
      username,
    });

    this.send(
      `${trackDetails.name.italic()} by ${trackDetails.artist.name.bold()} on last.fm: ${cleanURL(
        trackDetails.url
      )}`
    );
  }
}
