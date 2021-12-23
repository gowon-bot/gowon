import { LogicError } from "../../../errors";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { SpotifyBaseCommand } from "./SpotifyBaseCommand";
import { SpotifySearchParams } from "../../../services/Spotify/SpotifyService";

const args = {
  ...standardMentions,
  keywords: new StringArgument({ index: { start: 0 } }),
} as const;

export default class SpotifyTrack extends SpotifyBaseCommand<typeof args> {
  idSeed = "iz*one chaewon";

  description = "Links the spotify page for a track";
  aliases = ["fms", "spt"];

  arguments = args;

  customContext = {
    mutable: {},
  };

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

    await this.send(spotifyTrackSearch.bestResult.externalURLs.spotify);
  }
}
