import { cleanURL } from "../../../helpers/discord";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    artist: {
      index: {
        start: 0,
      },
    },
  },
  mentions: standardMentions,
} as const;

export default class ArtistPage extends LastFMBaseCommand<typeof args> {
  idSeed = "twice mina";

  aliases = ["arp", "arpa", "apage"];
  description = "Links you to an artist's page on Last.fm";
  subcategory = "pages";
  usage = ["", "artist"];

  arguments: Arguments = args;

  async run() {
    let artist = this.parsedArguments.artist;

    let { requestable } = await this.parseMentions();

    if (!artist) {
      artist = (await this.lastFMService.nowPlaying(requestable)).artist;
    }

    let artistDetails = await this.lastFMService.artistInfo({
      artist,
      username: requestable,
    });

    this.send(
      `${artistDetails.name.strong()} on last.fm: ${cleanURL(
        artistDetails.url
      )}`
    );
  }
}
