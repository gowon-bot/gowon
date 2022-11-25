import { bold, cleanURL, italic } from "../../../helpers/discord";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...prefabArguments.track,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class TrackPage extends LastFMBaseCommand<typeof args> {
  idSeed = "twice dahyun";

  aliases = ["tpa", "trpa", "tpage"];
  description = "Links you to a track's page on Last.fm";
  subcategory = "pages";
  usage = ["artist | track"];

  arguments = args;

  slashCommand = true;

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
      `${italic(trackDetails.name)} by ${bold(
        trackDetails.artist.name
      )} on last.fm: ${cleanURL(trackDetails.url)}`
    );
  }
}
