import { BaseCommand } from "../BaseCommand";
import { Message, User } from "discord.js";
import { Arguments } from "../arguments";
import { numberDisplay } from "../helpers";

export class AlbumPlays extends BaseCommand {
  aliases = ["alp", "lp"];
  description = "Shows you how many plays you have of a given album";

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
    },
    mentions: {
      0: { name: "user", description: "The user to lookup" },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string,
      albumName = this.parsedArguments.track as string,
      user = this.parsedArguments.user as User;

    let senderUsername = await this.usersService.getUsername(message.author.id);
    let mentionedUsername = await this.usersService.getUsername(user?.id);

    let username = mentionedUsername || senderUsername;

    if (!artist || !albumName) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!albumName) albumName = nowPlaying.album;
    }

    let albumDetails = await this.lastFMService.albumInfo(
      artist,
      albumName,
      username
    );

    message.channel.send(
      `\`${username}\` has ${numberDisplay(
        albumDetails.album.userplaycount,
        "scrobble"
      )} of **${albumDetails.album.name}** by ${albumDetails.album.artist}`
    );
  }
}
