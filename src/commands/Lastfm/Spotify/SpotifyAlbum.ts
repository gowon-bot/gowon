import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { SpotifyBaseCommand } from "./SpotifyBaseCommand";

export default class SpotifyAlbum extends SpotifyBaseCommand {
  idSeed = "iz*one yena";

  description = "Links the spotify page for an album";
  aliases = ["fmsl", "spl"];

  arguments: Arguments = {
    inputs: {
      keywords: { index: { start: 0 } },
    },
    mentions: standardMentions,
  };

  async run() {
    let keywords = this.parsedArguments.keywords as string;

    let { username } = await this.parseMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlayingParsed(username);

      keywords = `${nowplaying.artist} - ${nowplaying.album}`;
    }

    const spotifyAlbum = await this.spotifyService.searchAlbumRaw(keywords);

    if (!spotifyAlbum)
      throw new LogicError(
        `that album wasn't found on spotify! Searched with \`${keywords}\``
      );

    await this.send(spotifyAlbum.external_urls.spotify);
  }
}
