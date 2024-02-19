import { LogicError } from "../../../errors/errors";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { SpotifyBaseCommand } from "./SpotifyBaseCommands";

const args = {
  keywords: new StringArgument({
    index: { start: 0 },
    description:
      "The keywords to search Spotify with (defaults to your currently playing artist)",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class SpotifyArtist extends SpotifyBaseCommand<typeof args> {
  idSeed = "iz*one chaeyeon";

  description = "Links the spotify page for an artist";
  aliases = ["fmsa", "spa"];

  arguments = args;

  slashCommand = true;

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

    await this.reply(spotifyArtistSearch.bestResult.externalURLs.spotify);
  }
}
