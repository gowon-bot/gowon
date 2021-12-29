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

export default class SpotifyTrack extends SpotifyBaseCommand<typeof args> {
  idSeed = "iz*one chaewon";

  description = "Links the spotify page for a track";
  aliases = ["fms", "spt"];

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
