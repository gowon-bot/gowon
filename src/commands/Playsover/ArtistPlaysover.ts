import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay } from "../../helpers";

export default class ArtistPlaysover extends BaseCommand {
  aliases = ["po", "apo"];
  description = "Shows you how many artists you have over a certain playcount";
  arguments: Arguments = {
    inputs: {
      plays: { index: 0 },
    },
    mentions: {
      0: { name: "user", description: "the user to lookup" },
    },
  };

  async run(message: Message) {
    let plays = parseInt(this.parsedArguments.plays as string, 10);

    let { username, perspective } = await this.parseMentionedUsername(message);

    let topArtists = await this.lastFMService.topArtists(username, 1000);

    let playsover = 0;

    for (let artist of topArtists.artist) {
      if (parseInt(artist.playcount, 10) > plays) playsover++;
      else break;
    }

    await message.reply(
      `**${playsover}** of ${
        perspective.possessive
      } top 1,000 artist have at least **${numberDisplay(plays, "play")}**`
    );
  }
}
