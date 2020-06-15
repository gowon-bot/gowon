import { BaseCommand } from "../../BaseCommand";
import { Message, User } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay } from "../../helpers";

export default class ArtistAt extends BaseCommand {
  aliases = ["aa"];
  description = "Finds the artist at a certain rank";
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

    if (isNaN(rank) || rank < 0 || rank > 1000) {
      await message.reply("please enter a valid rank (1-1000)");
      return;
    }

    let username = await this.usersService.getUsername(
      user?.id || message.author.id
    );

    let topArtists = await this.lastFMService.topArtists(username, 1, rank);

    let artist = topArtists.artist[0];

    await message.reply(
      `${artist.name} is ranked at **${
        artist["@attr"].rank
      }** in your top artists with ${numberDisplay(artist.playcount, "play")}`
    );
  }
}
