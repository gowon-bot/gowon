import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
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
    let rank = parseInt(this.parsedArguments.rank as string, 10);

    if (isNaN(rank) || rank < 0 || rank > 1000) {
      await message.reply("please enter a valid rank (1-1000)");
      return;
    }

    let { username, perspective } = await this.parseMentionedUsername(message);

    let topArtists = await this.lastFMService.topArtists(username, 1, rank);

    let artist = topArtists.artist[0];

    await message.reply(
      `${artist.name} is ranked at **#${artist["@attr"].rank}** in ${
        perspective.possessive
      } top artists with ${numberDisplay(artist.playcount, "play")}`
    );
  }
}
