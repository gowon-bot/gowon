import { cleanURL } from "../../../helpers/discord";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class TrackPage extends LastFMBaseCommand<typeof args> {
  idSeed = "twice dahyun";

  aliases = ["tpa", "trpa", "tpage"];
  description = "Links you to a track's page on Last.fm";
  subcategory = "pages";
  usage = ["artist | track"];

  arguments: Arguments = args;

  async run() {
    const { requestable } = await this.getMentions();

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
