import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { SpotifyBaseCommand } from "./SpotifyBaseCommand";

const args = {
  inputs: {
    keywords: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class SpotifyAlbum extends SpotifyBaseCommand<typeof args> {
  idSeed = "iz*one yena";

  description = "Links the spotify page for an album";
  aliases = ["fmsl", "spl"];

  arguments: Arguments = args;

  async run() {
    let keywords = this.parsedArguments.keywords;

    let { requestable } = await this.parseMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlaying(
        this.ctx,
        requestable
      );

      keywords = `${nowplaying.artist} - ${nowplaying.album}`;
    }

    const spotifyAlbum = await this.spotifyService.searchAlbumRaw(
      this.ctx,
      keywords
    );

    if (!spotifyAlbum)
      throw new LogicError(
        `that album wasn't found on spotify! Searched with \`${keywords}\``
      );

    await this.send(spotifyAlbum.external_urls.spotify);
  }
}
