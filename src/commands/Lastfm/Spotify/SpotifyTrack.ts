import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { SpotifyBaseCommand } from "./SpotifyBaseCommand";

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

    let { username } = await this.parseMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlaying(username);

      keywords = `${nowplaying.artist} - ${nowplaying.name}`;
    }

    const spotifyTrack = await this.spotifyService.searchTrackRaw(keywords);

    if (!spotifyTrack)
      throw new LogicError(
        `that song wasn't found on spotify! Searched with \`${keywords}\``
      );

    await this.send(spotifyTrack.external_urls.spotify);
  }
}
