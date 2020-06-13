import { BaseCommand } from "../BaseCommand";
import { Message, User } from "discord.js";
import { Arguments } from "../arguments";
import { numberDisplay } from "../helpers";

export class ArtistPlays extends BaseCommand {
  aliases = ["ap"];
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
    let artist = this.parsedArguments.artist as string,
      user = this.parsedArguments.user as User;

    let senderUsername = await this.usersService.getUsername(message.author.id);
    let mentionedUsername = await this.usersService.getUsername(user?.id);

    let username = mentionedUsername || senderUsername;

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let artistDetails = await this.lastFMService.artistInfo(artist, username);

    message.channel.send(
      `\`${username}\` has ${numberDisplay(
        artistDetails.artist.stats.userplaycount,
        "scrobble"
      )} of **${artistDetails.artist.name}**`
    );
  }
}
