import {
  AlbumHasNoCoverError,
  NoAlbumForCoverError,
} from "../../errors/external/lastfm";
import { bold } from "../../helpers/discord";
import { Flag } from "../../lib/context/arguments/argumentTypes/Flag";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { AlbumInfo } from "../../services/LastFM/converters/InfoTypes";
import { RecentTrack } from "../../services/LastFM/converters/RecentTracks";
import { LastFMArgumentsMutableContext } from "../../services/LastFM/LastFMArguments";
import { AlbumCoverService } from "../../services/moderation/AlbumCoverService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  ...prefabArguments.album,
  ...standardMentions,
  noAlternate: new Flag({
    description: "Do not fetch custom alternate album covers",
    shortnames: ["na", "noalt"],
    longnames: ["noalternate", "no-alternate", "noalt"],
  }),
} satisfies ArgumentsMap;

export default class Cover extends LastFMBaseCommand<typeof args> {
  idSeed = "april chaekyung";

  aliases = ["co"];
  description = "Shows the cover for a given album";
  usage = ["", "artist | album @user"];

  slashCommand = true;

  arguments = args;

  albumCoverService = ServiceRegistry.get(AlbumCoverService);

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
      this.ctx.getMutable<LastFMArgumentsMutableContext>().nowplaying;

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
    const albumCover = await this.albumCoverService.getWithDetails(
      this.ctx,
      image,
      {
        metadata: { artist, album },
        enlarge: true,
        moderation: this.parsedArguments.noAlternate ? true : undefined,
      }
    );

    if (!album) throw new NoAlbumForCoverError();
    if (!albumCover.url) throw new AlbumHasNoCoverError(artist, album);

    await this.send(
      `Cover for ${bold(album)} by ${bold(artist)}${
        albumCover.source === "moderation"
          ? "\n*This image has been set by Gowon moderators*"
          : albumCover.source === "custom"
          ? "\n*This image has been custom set by the user*"
          : ""
      }`,
      {
        files: [
          {
            attachment: albumCover.url,
            name: albumCover.fileExtension
              ? `${artist} - ${album}.${albumCover.fileExtension}`
              : undefined,
            description: `The album cover for ${album} by ${artist}`,
          },
        ],
      }
    );
  }

  private async blueTape() {
    await this.send(
      `Cover for ${bold("Blue Tape")} by ${bold(
        "f(x)"
      )}. *(Thanks to jopping and ember for the image)*`,
      { files: ["http://gowon.ca/images/blueTape.png"] }
    );
  }
}
