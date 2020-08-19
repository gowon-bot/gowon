import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ArtistAt extends LastFMBaseCommand {
  aliases = ["aa"];
  description = "Finds the artist at a certain rank";
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

  async run(message: Message) {
    let rank = this.parsedArguments.rank as number;

    if (isNaN(rank) || rank < 0) {
      await message.reply("please enter a valid rank");
      return;
    }

    let { username, perspective } = await this.parseMentionedUsername(message);

    let topArtists = await this.lastFMService.topArtists({
      username,
      limit: 1,
      page: rank,
    });

    let artist = topArtists.artist[0];

    await message.reply(
      `${artist.name.bold()} is ranked at #${artist["@attr"].rank.bold()} in ${
        perspective.possessive
      } top artists with ${numberDisplay(artist.playcount, "play").bold()}`
    );
  }
}
