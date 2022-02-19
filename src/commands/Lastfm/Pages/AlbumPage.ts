import { cleanURL } from "../../../helpers/discord";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  ...prefabArguments.album,
} as const;

export default class AlbumPage extends LastFMBaseCommand<typeof args> {
  idSeed = "twice jihyo";

  aliases = ["alpa", "lpa", "lpage"];
  description = "Links you to an album's page on Last.fm";
  subcategory = "pages";
  usage = ["", "artist | album"];

  arguments = args;

  async run() {
    const { requestable } = await this.parseMentions();

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
