import { cleanURL } from "../../../helpers/discord";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  ...prefabArguments.track,
} as const;

export default class TrackPage extends LastFMBaseCommand<typeof args> {
  idSeed = "twice dahyun";

  aliases = ["tpa", "trpa", "tpage"];
  description = "Links you to a track's page on Last.fm";
  subcategory = "pages";
  usage = ["artist | track"];

  arguments = args;

  async run() {
    const { requestable } = await this.parseMentions();

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      requestable
    );

    const trackDetails = await this.lastFMService.trackInfo(this.ctx, {
      artist,
      track,
      username: requestable,
    });

    this.send(
      `${trackDetails.name.italic()} by ${trackDetails.artist.name.strong()} on last.fm: ${cleanURL(
        trackDetails.url
      )}`
    );
  }
}
