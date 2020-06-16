import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay } from "../../helpers";

export default class AlbumPlaysover extends BaseCommand {
  aliases = ["alpo", "lpo"];
  description = "Shows you how many albums you have over a certain playcount";
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
