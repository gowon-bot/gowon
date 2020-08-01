import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class TrackPlaysover extends LastFMBaseCommand {
  aliases = ["alpo", "lpo"];
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
    let plays = (this.parsedArguments.plays as string)?.toInt();

    let { username, perspective } = await this.parseMentionedUsername(message);

    let topArtists = await this.lastFMService.topArtists(username, 1000);

    let playsover = 0;

    for (let album of topArtists.artist) {
      if (album.playcount.toInt() >= plays) playsover++;
      else break;
    }

    await message.reply(
      `${numberDisplay(playsover).bold()} of ${
        perspective.possessive
      } top 1,000 artists have at least ${numberDisplay(plays, "play").bold()}`
    );
  }
}
