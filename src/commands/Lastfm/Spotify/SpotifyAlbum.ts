import { LogicError } from "../../../errors";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { SpotifyBaseCommand } from "./SpotifyBaseCommand";

const args = {
  ...standardMentions,
  keywords: new StringArgument({ index: { start: 0 } }),
} as const;

export default class SpotifyAlbum extends SpotifyBaseCommand<typeof args> {
  idSeed = "iz*one yena";

  description = "Links the spotify page for an album";
  aliases = ["fmsl", "spl"];

  arguments = args;

  customContext = {
    mutable: {},
  };

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
