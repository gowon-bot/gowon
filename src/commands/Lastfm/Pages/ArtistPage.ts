import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ArtistPage extends LastFMBaseCommand {
  aliases = ["page", "apage", "arp", "arpa"];
  description = "Shows you how many plays you have of a given artist";

  arguments: Arguments = {
    inputs: {
      artist: {
        index: {
          start: 0,
        },
      },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let { username } = await this.parseMentionedUsername(
      message
    );

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(username))
        .artist;
    }

    let artistDetails = await this.lastFMService.artistInfo(artist, username);

    message.reply(`${artistDetails.name.bold()} on last.fm: ${artistDetails.url}`);
  }
}
