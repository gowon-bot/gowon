import { BaseCommand } from "../../BaseCommand";
import { Message, User } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay } from "../../helpers";

export default class AlbumAt extends BaseCommand {
  aliases = ["ala", "alra"];
  description = "Finds the album at a certain rank";
  arguments: Arguments = {
    mentions: {
      0: { name: "user", description: "The user to lookup" },
    },
    inputs: {
      rank: { index: 0 },
    },
  };

  async run(message: Message) {
    let rank = parseInt(this.parsedArguments.rank as string, 10),
      user = this.parsedArguments.user as User;

    let username = await this.usersService.getUsername(
      user?.id || message.author.id
    );

    let topAlbums = await this.lastFMService.topAlbums(username, 1, rank);

    let album = topAlbums.topalbums.album[0]

    await message.reply(
      `**${album.name}** by _${album.artist.name}_ is ranked at **${
        album["@attr"].rank
      }** in your top albums with ${numberDisplay(album.playcount, "play")}`
    );
  }
}
