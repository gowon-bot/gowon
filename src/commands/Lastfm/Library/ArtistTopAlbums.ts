import { MessageEmbed } from "discord.js";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class ArtistTopAlbums extends LastFMBaseCommand {
  description = "Shows your top albums from an artist";
  aliases = ["atl", "atal"];
  usage = ["", "artist @user"];

  arguments: Arguments = {
    inputs: {
      artist: {
        index: {
          start: 0,
        },
      },
    },
    mentions: standardMentions,
  };

  async run() {
    let artist = this.parsedArguments.artist as string;

    let { username, senderUsername } = await this.parseMentions({
      senderRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    } else {
      artist = await this.lastFMService.correctArtist({ artist });
    }

    let topAlbums = await this.lastFMService.scraper.artistTopAlbums(
      username,
      artist
    );

    let embed = new MessageEmbed()
      .setAuthor(
        this.message.author.username,
        this.message.author.avatarURL() || ""
      )
      .setTitle(`Top ${artist.bold()} albums for ${username.code()}`)
      .setDescription(
        `_${numberDisplay(topAlbums.total, `total scrobble`)}, ${numberDisplay(
          topAlbums.count!,
          `total album`
        )}_\n\n` +
          topAlbums.items
            .map(
              (ta) =>
                `${numberDisplay(ta.playcount, "play")} - ${ta.album.bold()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
