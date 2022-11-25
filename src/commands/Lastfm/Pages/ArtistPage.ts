import { bold, cleanURL } from "../../../helpers/discord";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...prefabArguments.artist,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class ArtistPage extends LastFMBaseCommand<typeof args> {
  idSeed = "twice mina";

  aliases = ["arp", "arpa", "apage"];
  description = "Links you to an artist's page on Last.fm";
  subcategory = "pages";
  usage = ["", "artist"];

  slashCommand = true;

  arguments = args;

  async run() {
    const { requestable } = await this.getMentions();

    const artist = await this.lastFMArguments.getArtist(this.ctx, requestable);

    const artistDetails = await this.lastFMService.artistInfo(this.ctx, {
      artist,
      username: requestable,
    });

    this.send(
      `${bold(artistDetails.name)} on last.fm: ${cleanURL(artistDetails.url)}`
    );
  }
}
