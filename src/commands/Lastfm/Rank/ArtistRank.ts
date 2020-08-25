import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ArtistRank extends LastFMBaseCommand {
  aliases = ["ar", "ra"];
  description = "Shows what rank the artist is at in your top 1000 artists";
  subcategory = "ranks";
  usage = ["artist @user"];

  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      artist: {
        index: { start: 0 },
      },
    },
  };

  async run() {
    let artist = this.parsedArguments.artist as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername();

    if (!artist)
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;

    let topArtists = await this.lastFMService.topArtists({
      username,
      limit: 1000,
    });

    let rank = topArtists.artist.findIndex(
      (a) => a.name.toLowerCase() === artist.toLowerCase()
    );

    if (rank === -1) {
      await this.reply(
        `that artist wasn't found in ${perspective.possessive} top 1000 artists`
      );
    } else {
      await this.reply(
        `${topArtists.artist[rank].name.bold()} is ranked #${numberDisplay(
          rank + 1
        ).bold()} in ${
          perspective.possessive
        } top 1,000 artists with ${numberDisplay(
          topArtists.artist[rank].playcount
        ).bold()} plays`
      );
    }
  }
}
