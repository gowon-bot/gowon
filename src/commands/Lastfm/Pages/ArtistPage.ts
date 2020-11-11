import { cleanURL } from "../../../helpers/discord";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ArtistPage extends LastFMBaseCommand {
  aliases = ["arp", "arpa"];
  description = "Links you to an artist's page on Last.fm";
  subcategory = "pages";
  usage = ["", "artist"];

  arguments: Arguments = {
    inputs: {
      artist: {
        index: {
          start: 0,
        },
      },
    },
    mentions: standardMentions,
  };

  async run() {
    let artist = this.parsedArguments.artist as string;

    let { username } = await this.parseMentions();

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(username)).artist;
    }

    let artistDetails = await this.lastFMService.artistInfo({
      artist,
      username,
    });

    this.reply(
      `${artistDetails.name.bold()} on last.fm: ${cleanURL(artistDetails.url)}`
    );
  }
}
