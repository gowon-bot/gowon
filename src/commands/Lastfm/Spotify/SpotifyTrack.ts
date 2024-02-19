import { LogicError } from "../../../errors/errors";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { SpotifySearchParams } from "../../../services/Spotify/SpotifyService";
import { SpotifyBaseCommand } from "./SpotifyBaseCommands";

const args = {
  keywords: new StringArgument({
    index: { start: 0 },
    description:
      "The keywords to search Spotify with (defaults to your currently playing track)",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class SpotifyTrack extends SpotifyBaseCommand<typeof args> {
  idSeed = "iz*one chaewon";

  description = "Links the spotify page for a track";
  aliases = ["fms", "spt"];

  arguments = args;

  slashCommand = true;

  async run() {
    const { requestable } = await this.getMentions({
      usernameRequired: !this.parsedArguments.keywords,
    });

    let params: SpotifySearchParams<{ artist: string; track: string }>;

    if (this.parsedArguments.keywords) {
      params = { keywords: this.parsedArguments.keywords };
    } else {
      params = await this.lastFMArguments.getTrack(this.ctx, requestable);
    }

    const spotifyTrackSearch = await this.spotifyService.searchTrack(
      this.ctx,
      params
    );

    if (!spotifyTrackSearch.hasAnyResults) {
      throw new LogicError(
        `that song wasn't found on Spotify! Searched with \`${this.getKeywords(
          params
        )}\``
      );
    }

    await this.reply(spotifyTrackSearch.bestResult.externalURLs.spotify);
  }
}
