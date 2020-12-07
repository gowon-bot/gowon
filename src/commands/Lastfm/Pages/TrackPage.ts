import { cleanURL } from "../../../helpers/discord";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class TrackPage extends LastFMBaseCommand {
  idSeed = "twice dahyun";

  aliases = ["tpa", "trpa"];
  description = "Links you to a track's page on Last.fm";
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
      `${trackDetails.name.italic()} by ${trackDetails.artist.name.strong()} on last.fm: ${cleanURL(
        trackDetails.url
      )}`
    );
  }
}
