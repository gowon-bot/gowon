import { cleanURL } from "../../../helpers/discord";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class TrackPage extends LastFMBaseCommand<typeof args> {
  idSeed = "twice dahyun";

  aliases = ["tpa", "trpa", "tpage"];
  description = "Links you to a track's page on Last.fm";
  subcategory = "pages";
  usage = ["artist | track"];

  arguments: Arguments = args;

  async run() {
    let artist = this.parsedArguments.artist,
      track = this.parsedArguments.track;

    let { requestable } = await this.parseMentions();

    if (!artist || !track) {
      let nowPlaying = await this.lastFMService.nowPlaying(requestable);

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    let trackDetails = await this.lastFMService.trackInfo({
      artist,
      track,
      username: requestable,
    });

    this.send(
      `${trackDetails.name.italic()} by ${trackDetails.artist.name.strong()} on last.fm: ${cleanURL(
        trackDetails.url
      )}`
    );
  }
}
