import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay, ucFirst } from "../../helpers";

export default class ArtistPlays extends BaseCommand {
  aliases = ["ap", "p"];
  description = "Shows you how many plays you have of a given artist";

  arguments: Arguments = {
    inputs: {
      artist: {
        index: {
          start: 0,
        },
      },
    },
    mentions: {
      0: { name: "user", description: "The user to lookup" },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let artistDetails = await this.lastFMService.artistInfo(artist, username);

    message.channel.send(
      `${ucFirst(perspective.plusToHave)} ${numberDisplay(
        artistDetails.stats.userplaycount,
        "scrobble"
      )} of **${artistDetails.name}**`
    );
  }
}
