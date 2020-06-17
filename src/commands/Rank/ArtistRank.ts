import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay } from "../../helpers";

export default class ArtistRank extends BaseCommand {
  aliases = ["ar", "ra"];
  description = "Shows what rank the artist is at in your top 1000 artists";
  arguments: Arguments = {
    mentions: { 0: { name: "user", description: "the user to lookup" } },
    inputs: {
      artist: {
        index: { start: 0 },
      },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!artist)
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;

    let topArtists = await this.lastFMService.topArtists(username, 1000);

    let rank = topArtists.artist.findIndex(
      (a) => a.name.toLowerCase() === artist.toLowerCase()
    );

    if (rank === -1) {
      await message.reply(
        `that artist wasn't found in ${perspective.possessive} top 1000 artists`
      );
    } else {
      await message.reply(
        `**${topArtists.artist[rank].name}** is ranked **#${rank + 1}** in ${
          perspective.possessive
        } top 1,000 artists with ${numberDisplay(topArtists.artist[rank].playcount)} plays`
      );
    }
  }
}
