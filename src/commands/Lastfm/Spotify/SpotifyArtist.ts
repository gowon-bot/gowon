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

    let { requestable } = await this.parseMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlaying(
        this.ctx,
        requestable
      );

      keywords = nowplaying.artist;
    }

    const spotifyArtist = await this.spotifyService.searchArtist(
      this.ctx,
      keywords
    );

    if (!spotifyArtist)
      throw new LogicError(
        `that artist wasn't found on spotify! Searched with \`${keywords}\``
      );

    await this.send(spotifyArtist.external_urls.spotify);
  }
}
