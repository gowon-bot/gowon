import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ArtistPlaysover extends LastFMBaseCommand {
  aliases = ["po", "apo"];
  description = "Shows you how many artists you have over a certain playcount";
  arguments: Arguments = {
    inputs: {
      plays: { index: 0 },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
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
