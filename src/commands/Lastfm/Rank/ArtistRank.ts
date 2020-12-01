import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class ArtistRank extends LastFMBaseCommand {
  aliases = ["ar", "ra"];
  description = "Shows what rank an artist is in your top 1000 artists";
  subcategory = "ranks";
  usage = ["artist @user"];

  arguments: Arguments = {
    inputs: {
      artist: {
        index: { start: 0 },
      },
    },
    mentions: standardMentions,
  };

  async run() {
    let artist = this.parsedArguments.artist as string;

    let { username, senderUsername, perspective } = await this.parseMentions({
      senderRequired: !artist,
    });

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
        `that artist wasn't found in ${
          perspective.possessive
        } top ${numberDisplay(topArtists.artist.length, "artist")}`
      );
    } else {
      await this.reply(
        `${topArtists.artist[rank].name.strong()} is ranked #${numberDisplay(
          rank + 1
        ).strong()} in ${
          perspective.possessive
        } top 1,000 artists with ${numberDisplay(
          topArtists.artist[rank].playcount
        ).strong()} plays`
      );
    }
  }
}
