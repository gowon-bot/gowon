import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class AlbumAt extends LastFMBaseCommand {
  aliases = ["ala"];
  description = "Finds the album at a certain rank";
  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      rank: { index: 0 },
    },
  };

  async run(message: Message) {
    let rank = parseInt(this.parsedArguments.rank as string, 10);

    if (isNaN(rank) || rank < 0) {
      await message.reply("please enter a valid rank");
      return;
    }

    let { username, perspective } = await this.parseMentionedUsername(message);

    let topAlbums = await this.lastFMService.topAlbums(username, 1, rank);

    let album = topAlbums.album[0];

    await message.reply(
      `${album.name.bold()} by ${album.artist.name.italic()} is ranked at #${
        album["@attr"].rank.bold()
      } in ${perspective.possessive} top albums with ${numberDisplay(
        album.playcount,
        "play"
      ).bold()}`
    );
  }
}
