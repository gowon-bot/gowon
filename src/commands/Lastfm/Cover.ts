import { Message } from "discord.js";
import { LogicError } from "../../errors";
import { Arguments } from "../../lib/arguments/arguments";
import { standardMentions } from "../../lib/arguments/mentions/mentions";
import { AlbumInfo, Track } from "../../services/LastFM/LastFMService.types";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class Cover extends LastFMBaseCommand<typeof args> {
  idSeed = "april chaekyung";

  aliases = ["co"];
  description = "Shows the cover for a given album";
  usage = ["", "artist | album @user"];

  arguments: Arguments = args;

  async run(_: Message) {
    let artist = this.parsedArguments.artist,
      album = this.parsedArguments.album;

    let { username } = await this.parseMentions({
      usernameRequired: !artist || !album,
    });

    let nowPlaying: Track | undefined = undefined;

    if (!artist || !album) {
      nowPlaying = await this.lastFMService.nowPlaying(username);

      if (!artist) artist = nowPlaying.artist["#text"];
      if (!album) album = nowPlaying.album["#text"];
    }

    let albumDetails: AlbumInfo | undefined = undefined;

    try {
      albumDetails = await this.lastFMService.albumInfo({ artist, album });
    } catch {}

    if (albumDetails) {
      this.sendFromAlbumDetails(albumDetails);
    } else if (nowPlaying) {
      this.sendFromNowPlaying(nowPlaying);
    } else {
      throw new LogicError("that album could not be found!");
    }
  }

  private async sendFromAlbumDetails(albumInfo: AlbumInfo) {
    console.log(albumInfo.image);

    let image = albumInfo.image.find((i) => i.size === "extralarge");

    if (!image?.["#text"])
      throw new LogicError("that album doesn't have a cover!");

    await this.sendWithFiles(
      `Cover for ${albumInfo.name.italic()} by ${albumInfo.artist.strong()}`,
      [this.enlargeImage(image?.["#text"] ?? "")]
    );
  }

  private async sendFromNowPlaying(nowPlaying: Track) {
    let image = nowPlaying.image.find((i) => i.size === "extralarge");

    if (!image?.["#text"])
      throw new LogicError("that album doesn't have a cover!");

    await this.sendWithFiles(
      `Cover for ${nowPlaying.album["#text"].strong()} by ${nowPlaying.artist[
        "#text"
      ].strong()}`,
      [this.enlargeImage(image?.["#text"] ?? "")]
    );
  }

  private enlargeImage(url: string): string {
    return url.replace(/\d+x\d+/, "2048x2048");
  }
}
