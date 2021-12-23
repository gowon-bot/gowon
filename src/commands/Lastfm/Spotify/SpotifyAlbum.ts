import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { SpotifySearchParams } from "../../../services/Spotify/SpotifyService";
import { SpotifyBaseCommand } from "./SpotifyBaseCommands";

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
    let params: SpotifySearchParams<{ artist: string; album: string }>;

    const { requestable } = await this.getMentions({
      usernameRequired: !this.parsedArguments.keywords,
    });

    if (this.parsedArguments.keywords) {
      params = { keywords: this.parsedArguments.keywords };
    } else {
      params = await this.lastFMArguments.getAlbum(this.ctx, requestable);
    }

    const spotifyAlbumSearch = await this.spotifyService.searchAlbum(
      this.ctx,
      params
    );

    if (!spotifyAlbumSearch.hasAnyResults) {
      throw new LogicError(
        `that album wasn't found on Spotify! Searched with \`${this.getKeywords(
          params
        )}\``
      );
    }

    await this.send(spotifyAlbumSearch.bestResult.externalURLs.spotify);
  }
}
