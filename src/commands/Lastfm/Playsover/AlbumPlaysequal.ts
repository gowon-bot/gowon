import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { toInt } from "../../../helpers/lastFM";

const args = {
  inputs: {
    plays: { index: 0, default: 100, number: true },
  },
  mentions: standardMentions,
} as const;

export default class AlbumPlaysequal extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan haebin";

  aliases = ["alpe", "lpe"];
  description =
    "Shows you how many albums you have equal to a certain playcount";
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

    let playsequal = 0;

    for (let album of topAlbums.album) {
      if (toInt(album.playcount) === plays) playsequal++;
      if (toInt(album.playcount) < plays) break;
    }

    await this.traditionalReply(
      `${numberDisplay(playsequal).strong()} of ${
        perspective.possessive
      } top 1,000 albums have exactly ${numberDisplay(plays, "play").strong()}`
    );
  }
}
