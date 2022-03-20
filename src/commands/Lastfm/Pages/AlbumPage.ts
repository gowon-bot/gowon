import { bold, cleanURL, italic } from "../../../helpers/discord";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...prefabArguments.album,
  ...standardMentions,
} as const;

export default class AlbumPage extends LastFMBaseCommand<typeof args> {
  idSeed = "twice jihyo";

  aliases = ["alpa", "lpa", "lpage"];
  description = "Links you to an album's page on Last.fm";
  subcategory = "pages";
  usage = ["", "artist | album"];

  slashCommand = true;

  arguments = args;

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
      `${italic(albumDetails.name)} by ${bold(
        albumDetails.artist
      )} on last.fm: ${cleanURL(albumDetails.url)}`
    );
  }
}
