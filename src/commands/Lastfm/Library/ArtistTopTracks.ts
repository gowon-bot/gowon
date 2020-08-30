import { MessageEmbed } from "discord.js";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";

export default class ArtistTopTracks extends LastFMBaseCommand {
  description = "Shows your top tracks from an artist";
  aliases = ["att"];
  usage = ["", "artist @user"];

  arguments: Arguments = {
    inputs: {
      artist: {
        index: {
          start: 0,
        },
      },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  async run() {
    let artist = this.parsedArguments.artist as string;

    let { username, senderUsername } = await this.parseMentionedUsername();

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    } else {
      artist = await this.lastFMService.correctArtist({ artist });
    }

    let topTracks = await this.lastFMService.scraper.artistTopTracks(
      username,
      artist
    );

    let embed = new MessageEmbed()
      .setTitle(`Top ${artist.bold()} tracks for ${username.code()}`)
      .setDescription(
        `_${numberDisplay(topTracks.total, `total scrobble`)}, ${numberDisplay(
          topTracks.count!,
          `total track`
        )}_\n\n` +
          topTracks.items
            .map(
              (tt) =>
                `${numberDisplay(tt.playcount, "play")} - ${tt.track.bold()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
