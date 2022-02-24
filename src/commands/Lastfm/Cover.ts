import { LogicError } from "../../errors";
import { LinkGenerator } from "../../helpers/lastFM";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../lib/context/arguments/prefabArguments";
import { displayLink } from "../../lib/views/displays";
import { AlbumInfo } from "../../services/LastFM/converters/InfoTypes";
import { RecentTrack } from "../../services/LastFM/converters/RecentTracks";
import { LastFMArgumentsMutableContext } from "../../services/LastFM/LastFMArguments";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  ...standardMentions,
  ...prefabArguments.album,
} as const;

export default class Cover extends LastFMBaseCommand<typeof args> {
  idSeed = "april chaekyung";

  aliases = ["co"];
  description = "Shows the cover for a given album";
  usage = ["", "artist | album @user"];

  arguments = args;

  private readonly defaultImageURL =
    "https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png";

  async run() {
    const { requestable } = await this.getMentions({
      usernameRequired:
        !this.parsedArguments.artist || !this.parsedArguments.album,
    });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      requestable
    );

    const nowPlaying =
      this.mutableContext<LastFMArgumentsMutableContext>().mutable.nowplaying;

    if (
      artist.toLowerCase() === "f(x)" &&
      album.toLowerCase() === "blue tape"
    ) {
      this.blueTape();
      return;
    }

    if (nowPlaying?.artist === artist && nowPlaying?.album === album) {
      await this.sendFromNowPlaying(nowPlaying);
    } else {
      const albumDetails = await this.lastFMService.albumInfo(this.ctx, {
        artist,
        album,
      });

      await this.sendFromAlbumDetails(albumDetails);
    }
  }

  private async sendFromAlbumDetails(albumInfo: AlbumInfo) {
    const image = albumInfo.images.get("extralarge");

    await this.sendCoverImage(albumInfo.artist, albumInfo.name, image);
  }

  private async sendFromNowPlaying(nowPlaying: RecentTrack) {
    const image = nowPlaying.images.get("extralarge");

    await this.sendCoverImage(nowPlaying.artist, nowPlaying.album, image);
  }

  private async sendCoverImage(artist: string, album: string, image?: string) {
    this.checkIfAlbumHasCover(artist, album, image);
    try {
      await this.send(`Cover for ${album.strong()} by ${artist.strong()}`, {
        files: [this.enlargeImage(image!)],
      });
    } catch (e) {
      await this.send(`Cover for ${album.strong()} by ${artist.strong()}`, {
        files: [image!],
      });
    }
  }

  private enlargeImage(url: string): string {
    return url.replace(/\d+x\d+/, "2048x2048");
  }

  private checkIfAlbumHasCover(artist: string, album: string, image?: string) {
    if (!image || image === this.defaultImageURL) {
      throw new LogicError(
        `that album doesn't have a cover yet! You can add one ${displayLink(
          "here",
          LinkGenerator.imageUploadLink(artist, album)
        )}.`
      );
    }
  }

  private async blueTape() {
    await this.send(
      `Cover for ${"Blue Tape".strong()} by ${"f(x)".strong()}. *(Thanks to jopping and ember for the image)*`,
      { files: ["http://gowon.ca/images/blueTape.png"] }
    );
  }
}
