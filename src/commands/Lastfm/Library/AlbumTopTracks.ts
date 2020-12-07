import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LinkGenerator } from "../../../helpers/lastFM";

export default class AlbumTopTracks extends LastFMBaseCommand {
  idSeed = "nature sunshine";

  description = "Shows your top tracks from an album";
  aliases = ["ltt"];
  usage = ["", "artist | album @user"];
  subcategory = "library";

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
    },
    mentions: standardMentions,
  };

  async run() {
    let artist = this.parsedArguments.artist as string,
      album = this.parsedArguments.album as string;

    let { senderUsername, username } = await this.parseMentions({
      senderRequired: !artist || !album,
    });

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

    let embed = this.newEmbed()
      .setAuthor(
        this.message.author.username,
        this.message.author.avatarURL() || ""
      )
      .setTitle(`Top tracks on ${artist} - ${album} for ${username}`)
      .setURL(LinkGenerator.libraryAlbumPage(username, artist, album))
      .setDescription(
        `_${numberDisplay(topAlbums.total, `total scrobble`)}_\n\n` +
          topAlbums.items
            .map(
              (tt) =>
                `${numberDisplay(tt.playcount, "play")} - ${tt.track.strong()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
