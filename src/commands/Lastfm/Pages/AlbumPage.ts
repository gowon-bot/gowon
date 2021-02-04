import { cleanURL } from "../../../helpers/discord";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class AlbumPage extends LastFMBaseCommand<typeof args> {
  idSeed = "twice jihyo";

  aliases = ["alpa", "lpa"];
  description = "Links you to an album's page on Last.fm";
  subcategory = "pages";
  usage = ["", "artist | album"];

  arguments: Arguments = args;

  async run() {
    let artist = this.parsedArguments.artist,
      album = this.parsedArguments.album;

    let { username } = await this.parseMentions();

    if (!artist || !album) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(username);

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    }

    let albumDetails = await this.lastFMService.albumInfo({
      artist,
      album,
      username,
    });

    this.send(
      `${albumDetails.name.italic()} by ${albumDetails.artist.strong()} on last.fm: ${cleanURL(
        albumDetails.url
      )}`
    );
  }
}
