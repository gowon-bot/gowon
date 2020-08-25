import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay, ucFirst } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";

export default class AlbumAt extends LastFMBaseCommand {
  aliases = ["ala"];
  description = "Finds the album at a certain rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      rank: { index: 0, default: 1, number: true },
    },
  };

  async run() {
    let rank = this.parsedArguments.rank as number;

    if (isNaN(rank) || rank < 0) {
      await this.reply("please enter a valid rank");
      return;
    }

    let { username, perspective } = await this.parseMentionedUsername();

    let topAlbums = await this.lastFMService.topAlbums({
      username,
      limit: 1,
      page: rank,
    });

    let album = topAlbums.album[0];

    if (!album)
      throw new LogicError(
        `${ucFirst(
          perspective.name
        )} haven't scrobbled an album at that position!`
      );

    await this.reply(
      `${album.name.bold()} by ${album.artist.name.italic()} is ranked at #${album[
        "@attr"
      ].rank.bold()} in ${
        perspective.possessive
      } top albums with ${numberDisplay(album.playcount, "play").bold()}`
    );
  }
}
