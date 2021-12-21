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

  aliases = ["alpa", "lpa", "lpage"];
  description = "Links you to an album's page on Last.fm";
  subcategory = "pages";
  usage = ["", "artist | album"];

  arguments: Arguments = args;

  async run() {
    const { requestable } = await this.getMentions();

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      requestable
    );

    const albumDetails = await this.lastFMService.albumInfo(this.ctx, {
      artist,
      album,
      username: requestable,
    });

    this.send(
      `${albumDetails.name.italic()} by ${albumDetails.artist.strong()} on last.fm: ${cleanURL(
        albumDetails.url
      )}`
    );
  }
}
