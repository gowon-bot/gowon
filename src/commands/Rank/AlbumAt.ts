import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay } from "../../helpers";

export default class AlbumAt extends BaseCommand {
  aliases = ["ala"];
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
    let rank = parseInt(this.parsedArguments.rank as string, 10);

    if (isNaN(rank) || rank < 0 || rank > 1000) {
      await message.reply("please enter a valid rank (1-1000)");
      return;
    }

    let { username, perspective } = await this.parseMentionedUsername(message);

    let topAlbums = await this.lastFMService.topAlbums(username, 1, rank);

    let album = topAlbums.album[0];

    await message.reply(
      `**${album.name}** by _${album.artist.name}_ is ranked at **#${
        album["@attr"].rank
      }** in ${perspective.possessive} top albums with ${numberDisplay(album.playcount, "play")}`
    );
  }
}
