import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";

const args = {
  ...standardMentions,
  plays: new NumberArgument({ default: 100 }),
} as const;

export default class AlbumPlaysover extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan nayoung";

  aliases = ["alpo", "lpo"];
  description = "Shows you how many albums you have over a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  arguments = args;

  async run() {
    let plays = this.parsedArguments.plays!;

    let { requestable, perspective } = await this.parseMentions();

    let topAlbums = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    let playsover = 0;

    for (let album of topAlbums.albums) {
      if (album.userPlaycount >= plays) playsover++;
      else break;
    }

    await this.traditionalReply(
      `${displayNumber(playsover).strong()} of ${
        perspective.possessive
      } top 1,000 albums have at least ${displayNumber(plays, "play").strong()}`
    );
  }
}
