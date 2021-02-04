import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    plays: { index: 0, default: 100, number: true },
  },
  mentions: standardMentions,
} as const;

export default class AlbumPlaysover extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan nayoung";

  aliases = ["alpo", "lpo"];
  description = "Shows you how many albums you have over a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  arguments: Arguments = args;

  async run() {
    let plays = this.parsedArguments.plays!;

    let { username, perspective } = await this.parseMentions();

    let topAlbums = await this.lastFMService.topAlbums({
      username,
      limit: 1000,
    });

    let playsover = 0;

    for (let album of topAlbums.album) {
      if (album.playcount.toInt() >= plays) playsover++;
      else break;
    }

    await this.reply(
      `${numberDisplay(playsover).strong()} of ${
        perspective.possessive
      } top 1,000 albums have at least ${numberDisplay(plays, "play").strong()}`
    );
  }
}
