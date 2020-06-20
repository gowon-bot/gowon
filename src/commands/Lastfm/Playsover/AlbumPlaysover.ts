import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class AlbumPlaysover extends LastFMBaseCommand {
  aliases = ["alpo", "lpo"];
  description = "Shows you how many albums you have over a certain playcount";
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

    let topAlbums = await this.lastFMService.topAlbums(username, 1000);

    let playsover = 0;

    for (let album of topAlbums.album) {
      if (parseInt(album.playcount, 10) > plays) playsover++;
      else break;
    }

    await message.reply(
      `**${playsover}** of ${
        perspective.possessive
      } top 1,000 albums have at least **${numberDisplay(plays, "play")}**`
    );
  }
}
