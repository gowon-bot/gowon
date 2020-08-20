import { Message, MessageEmbed } from "discord.js";
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

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string,
      album = this.parsedArguments.album as string;

    let { senderUsername, username } = await this.parseMentionedUsername(
      message
    );

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
        artist = (await this.lastFMService.artistInfo({ artist })).name;
      }
      if (!album) {
        album = nowPlaying.album;
      } else {
        album = (await this.lastFMService.albumInfo({ artist, album })).name;
      }
    }

    let topAlbums = await this.lastFMService.scraper.albumTopTracks(
      username,
      artist,
      album
    );

    let embed = new MessageEmbed()
      .setTitle(
        `Top tracks on ${artist.bold()} - ${album.italic()} for ${username.code()}`
      )
      .setDescription(
        topAlbums
          .map(
            (tt) =>
              `${numberDisplay(tt.playcount, "play")} - ${tt.track.bold()}`
          )
          .join("\n")
      );

    await message.channel.send(embed);
  }
}
