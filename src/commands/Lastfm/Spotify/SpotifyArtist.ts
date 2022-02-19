import { LogicError } from "../../../errors";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { SpotifyBaseCommand } from "./SpotifyBaseCommand";

const args = {
  ...standardMentions,
  keywords: new StringArgument({ index: { start: 0 } }),
} as const;

export default class SpotifyArtist extends SpotifyBaseCommand<typeof args> {
  idSeed = "iz*one chaeyeon";

  description = "Links the spotify page for an artist";
  aliases = ["fmsa", "spa"];

  arguments = args;

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
