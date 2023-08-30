import { bold, italic } from "../../../helpers/discord";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";
import { LastFMArgumentsMutableContext } from "../../../services/LastFM/LastFMArguments";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LilacLibraryService } from "../../../services/lilac/LilacLibraryService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...prefabArguments.track,
} satisfies ArgumentsMap;

export default class Scrobble extends LastFMBaseCommand<typeof args> {
  idSeed = "newjeans hanni";

  aliases = ["sb"];
  description = "Scrobble a track to Last.fm";
  usage = ["<reply to Spotify link or fm>", "artist | track"];

  arguments = args;

  lilacLibraryService = ServiceRegistry.get(LilacLibraryService);

  async run() {
    const { senderRequestable, dbUser, requestable } = await this.getMentions({
      dbUserRequired: true,
      lfmAuthentificationRequired: true,
    });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable
    );

    const trackInfo = await this.lastFMService.noErrorTrackInfo(this.ctx, {
      artist,
      track,
    });

    if (!trackInfo) {
      const baseConfirmationEmbed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Confirm scrobble"))
        .setDescription(
          `This track doesn't exist yet on Last.fm, are you sure you want to scrobble it?
          
          ${bold(track)} by ${italic(artist)}`
        );

      const confirmationEmbed = new ConfirmationEmbed(
        this.ctx,
        baseConfirmationEmbed
      ).withRejectionReact();

      const confirmation = await confirmationEmbed.awaitConfirmation(this.ctx);

      if (!confirmation) return;
    }

    const indexedTrackCounts = await this.lilacLibraryService.trackCounts(
      this.ctx,
      {
        track: { name: track, artist: { name: artist } },
        users: [{ discordID: dbUser.discordID }],
      }
    );

    const topAlbum =
      indexedTrackCounts.trackCounts[0]?.track?.album?.name ||
      trackInfo?.album?.name ||
      undefined;

    await this.lastFMService.scrobble(this.ctx, {
      track,
      artist,
      album: topAlbum,
      timestamp: new Date().getTime() / 1000,
      username: requestable,
    });

    const mutableContext = this.ctx.getMutable<LastFMArgumentsMutableContext>();

    const np = mutableContext.nowplaying || mutableContext.parsedNowplaying;

    const image =
      (await this.getTopAlbumCover(artist, topAlbum)) ||
      np?.images.get("large") ||
      trackInfo?.album?.images?.get("large");

    const albumName = topAlbum || trackInfo?.album?.name || np?.album;
    const trackName = trackInfo?.name || track;

    const albumCover = await this.albumCoverService.get(
      this.ctx,
      image,
      albumName
        ? {
            metadata: { artist, album: albumName },
          }
        : {}
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Track scrobbled"))
      .setTitle(trackName)
      .setDescription(
        `by ${bold(trackInfo?.artist.name || artist)}${
          albumName ? ` from ${italic(albumName)}` : ""
        }`
      );

    if (image) embed.setThumbnail(albumCover || "");

    await this.send(embed);
  }

  private async getTopAlbumCover(
    artist: string,
    album: string | undefined
  ): Promise<string | undefined> {
    if (album) {
      const albumInfo = await this.lastFMService.albumInfo(this.ctx, {
        artist,
        album,
      });

      return albumInfo?.images.get("large");
    } else return undefined;
  }
}
