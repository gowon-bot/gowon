import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class AlbumPlaysequal extends LastFMBaseCommand {
  idSeed = "gugudan haebin";
  
  aliases = ["alpe", "lpe"];
  description =
    "Shows you how many albums you have equal to a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  arguments: Arguments = {
    inputs: {
      plays: { index: 0, default: 100, number: true },
    },
    mentions: standardMentions,
  };

  async run() {
    let plays = this.parsedArguments.plays as number;

    let { username, perspective } = await this.parseMentions();

    let topAlbums = await this.lastFMService.topAlbums({
      username,
      limit: 1000,
    });

    let playsequal = 0;

    for (let album of topAlbums.album) {
      if (album.playcount.toInt() === plays) playsequal++;
      if (album.playcount.toInt() < plays) break;
    }

    await this.reply(
      `${numberDisplay(playsequal).strong()} of ${
        perspective.possessive
      } top 1,000 albums have exactly ${numberDisplay(plays, "play").strong()}`
    );
  }
}
