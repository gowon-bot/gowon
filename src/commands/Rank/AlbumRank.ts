import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";

export default class AlbumRank extends BaseCommand {
  aliases = ["alra", "lra"];
  description = "Shows what rank the album is at in your top 1000 albums";
  arguments: Arguments = {
    mentions: {
      0: { name: "user", description: "the user to lookup" },
    },
    inputs: {
      artist: {
        index: 0,
        splitOn: "|",
      },
      album: {
        index: 1,
        splitOn: "|",
      },
    },
  };

  async run(message: Message) {
    let album = this.parsedArguments.album as string,
      artist = this.parsedArguments.artist as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!album || !artist) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!album) album = nowPlaying.album;
      if (!artist) artist = nowPlaying.artist;
    }

    let topAlbums = await this.lastFMService.topAlbums(username, 1000);

    let rank = topAlbums.album.findIndex(
      (a) =>
        a.name.toLowerCase() === album.toLowerCase() &&
        a.artist.name.toLowerCase() === artist.toLowerCase()
    );

    if (rank === -1) {
      await message.reply(
        `that album wasn't found in ${perspective.possessive} top 1000 albums`
      );
    } else {
      await message.reply(
        `**${topAlbums.album[rank].name}** by ${
          topAlbums.album[rank].artist.name
        } is ranked **#${rank + 1}** in ${
          perspective.possessive
        } top 1,000 albums with ${topAlbums.album[rank].playcount} plays`
      );
    }
  }
}
