import { LogicError } from "../../../errors";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { SpotifyBaseCommand } from "./SpotifyBaseCommand";

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
    let keywords = this.parsedArguments.keywords;

    let { requestable } = await this.parseMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlaying(
        this.ctx,
        requestable
      );

      keywords = `${nowplaying.name} ${nowplaying.artist}`;
    }

    const spotifyTrack = await this.spotifyService.searchTrackRaw(
      this.ctx,
      keywords
    );

    if (!spotifyTrack)
      throw new LogicError(
        `that song wasn't found on spotify! Searched with \`${keywords}\``
      );

    await this.send(spotifyTrack.external_urls.spotify);
  }
}
