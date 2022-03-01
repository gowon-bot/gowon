import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";

const args = {
  plays: new NumberArgument({ default: 100 }),
  ...standardMentions,
} as const;

export default class AlbumPlaysequal extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan haebin";

  aliases = ["alpe", "lpe"];
  description =
    "Shows you how many albums you have equal to a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  arguments = args;

  async run() {
    let plays = this.parsedArguments.plays;

    let { requestable, perspective } = await this.getMentions();

    let topAlbums = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    let playsequal = 0;

    for (let album of topAlbums.albums) {
      if (album.userPlaycount === plays) playsequal++;
      if (album.userPlaycount < plays) break;
    }

    await this.traditionalReply(
      `${displayNumber(playsequal).strong()} of ${
        perspective.possessive
      } top 1,000 albums have exactly ${displayNumber(plays, "play").strong()}`
    );
  }
}
