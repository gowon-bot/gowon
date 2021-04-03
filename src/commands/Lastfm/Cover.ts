import { Message } from "discord.js";
import { LogicError } from "../../errors";
import { display } from "../../helpers/discord";
import { LinkGenerator } from "../../helpers/lastFM";
import { Arguments } from "../../lib/arguments/arguments";
import { standardMentions } from "../../lib/arguments/mentions/mentions";
import {
  AlbumInfo,
  Image,
  Track,
} from "../../services/LastFM/LastFMService.types";
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

  private readonly defaultImageURL =
    "https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png";

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

    if (
      nowPlaying?.artist["#text"] === artist &&
      nowPlaying?.album["#text"] === album
    ) {
      await this.sendFromNowPlaying(nowPlaying);
    } else {
      const albumDetails = await this.lastFMService.albumInfo({
        artist,
        album,
      });

      await this.sendFromAlbumDetails(albumDetails);
    }
  }

  private async sendFromAlbumDetails(albumInfo: AlbumInfo) {
    let image = albumInfo.image.find((i) => i.size === "extralarge");

    await this.sendCoverImage(albumInfo.artist, albumInfo.name, image);
  }

  private async sendFromNowPlaying(nowPlaying: Track) {
    let image = nowPlaying.image.find((i) => i.size === "extralarge");

    await this.sendCoverImage(
      nowPlaying.artist["#text"],
      nowPlaying.album["#text"],
      image
    );
  }

  private async sendCoverImage(artist: string, album: string, image?: Image) {
    this.checkIfAlbumHasCover(artist, album, image);
    try {
      await this.sendWithFiles(
        `Cover for ${album.strong()} by ${artist.strong()}`,
        [this.enlargeImage(image!["#text"]!)]
      );
    } catch (e) {
      await this.sendWithFiles(
        `Cover for ${album.strong()} by ${artist.strong()}`,
        [image!["#text"]]
      );
    }
  }

  private enlargeImage(url: string): string {
    return url.replace(/\d+x\d+/, "2048x2048");
  }

  private checkIfAlbumHasCover(artist: string, album: string, image?: Image) {
    if (!image?.["#text"] || image["#text"] === this.defaultImageURL) {
      throw new LogicError(
        `that album doesn't have a cover yet! You can add one ${display(
          "here",
          LinkGenerator.imageUploadLink(artist, album)
        )}.`
      );
    }
  }
}
