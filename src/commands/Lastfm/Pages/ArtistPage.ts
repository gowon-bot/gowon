import { cleanURL } from "../../../helpers/discord";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ArtistPage extends LastFMBaseCommand {
  aliases = ["page", "apage", "arp", "arpa"];
  description = "Links you to the artist page on lastfm";
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
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  async run() {
    let artist = this.parsedArguments.artist as string;

    let { username } = await this.parseMentionedUsername();

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
