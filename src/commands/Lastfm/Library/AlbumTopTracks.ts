import { MessageEmbed } from "discord.js";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";

export default class AlbumTopTracks extends LastFMBaseCommand {
  description = "Shows your top tracks from an album";
  aliases = ["ltt"];
  usage = ["", "artist | album @user"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
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
    let artist = this.parsedArguments.artist as string,
      album = this.parsedArguments.album as string;

    let { senderUsername, username } = await this.parseMentionedUsername();

    if (artist && album) {
      let albumInfo = await this.lastFMService.albumInfo({ artist, album });
      artist = albumInfo.artist;
      album = albumInfo.name;
    }

    if (!artist || !album) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) {
        artist = nowPlaying.artist;
      } else {
        artist = await this.lastFMService.correctArtist({ artist });
      }
      if (!album) {
        album = nowPlaying.album;
      } else {
        let corrected = await this.lastFMService.correctAlbum({
          artist,
          album,
        });

        artist = corrected.artist;
        album = corrected.album;
      }
    }

    let topAlbums = await this.lastFMService.scraper.albumTopTracks(
      username,
      artist,
      album
    );

    let embed = new MessageEmbed()
      .setAuthor(
        this.message.author.username,
        this.message.author.avatarURL() || ""
      )
      .setTitle(
        `Top tracks on ${artist.bold()} - ${album.italic()} for ${username.code()}`
      )
      .setDescription(
        `_${numberDisplay(topAlbums.total, `total scrobble`)}_\n\n` +
          topAlbums.items
            .map(
              (tt) =>
                `${numberDisplay(tt.playcount, "play")} - ${tt.track.bold()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
