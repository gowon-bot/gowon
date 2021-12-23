import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { SpotifyBaseCommand } from "./SpotifyBaseCommands";

const args = {
  inputs: {
    keywords: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class SpotifyArtist extends SpotifyBaseCommand<typeof args> {
  idSeed = "iz*one chaeyeon";

  description = "Links the spotify page for an artist";
  aliases = ["fmsa", "spa"];

  arguments: Arguments = args;

  async run() {
    let keywords = this.parsedArguments.keywords;

    const { requestable } = await this.getMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      const artist = await this.lastFMArguments.getArtist(
        this.ctx,
        requestable
      );

      keywords = artist;
    }

    const spotifyArtistSearch = await this.spotifyService.searchArtist(
      this.ctx,
      keywords
    );

    if (!spotifyArtistSearch.hasAnyResults) {
      throw new LogicError(
        `that artist wasn't found on Spotify! Searched with \`${keywords}\``
      );
    }

    await this.send(spotifyArtistSearch.bestResult.externalURLs.spotify);
  }
}
