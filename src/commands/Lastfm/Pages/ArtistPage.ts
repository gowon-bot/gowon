import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ArtistPage extends LastFMBaseCommand {
  aliases = ["page", "apage", "arp", "arpa"];
  description = "Links you to the artist page on lastfm";
  subcategory = "pages"
  usage = ["", "artist"]

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

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let { username } = await this.parseMentionedUsername(message);

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(username)).artist;
    }

    let artistDetails = await this.lastFMService.artistInfo(artist, username);

    message.reply(
      `${artistDetails.name.bold()} on last.fm: ${artistDetails.url}`
    );
  }
}
