import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { SpotifyBaseCommand } from "./SpotifyBaseCommand";

export default class SpotifyTrack extends SpotifyBaseCommand {
  idSeed = "iz*one chaewon";

  description = "Links the spotify page for a track";
  aliases = ["fms", "spt"];

  arguments: Arguments = {
    inputs: {
      keywords: { index: { start: 0 } },
    },
    mentions: standardMentions,
  };

  async run() {
    let keywords = this.parsedArguments.keywords as string;

    let { username } = await this.parseMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlayingParsed(username);

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
