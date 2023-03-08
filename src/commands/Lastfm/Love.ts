import { bold, italic } from "../../helpers/discord";
import { Variation } from "../../lib/command/Command";
import { prefabArguments } from "../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { LastFMArgumentsMutableContext } from "../../services/LastFM/LastFMArguments";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  ...prefabArguments.track,
} satisfies ArgumentsMap;

export default class Love extends LastFMBaseCommand<typeof args> {
  idSeed = "shasha i an";

  description = "Loves a track on Last.fm";
  usage = ["", "artist | track"];

  aliases = ["luv"];

  variations: Variation[] = [
    {
      name: "unlove",
      variation: ["unlove", "hate"],
      separateSlashCommand: true,
    },
  ];

  slashCommand = true;

  arguments = args;

  async run() {
    const { senderRequestable } = await this.getMentions({
      lfmAuthentificationRequired: true,
    });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable
    );

    const mutableContext = this.mutableContext<LastFMArgumentsMutableContext>();

    const np = mutableContext.mutable.nowplaying;
    const parsedNp = mutableContext.mutable.parsedNowplaying;

    const isNowPlaying =
      (np && np.artist === artist && np.name == track) ||
      (parsedNp && parsedNp.artist === artist && parsedNp.name === track);

    const trackInfo = await this.lastFMService.trackInfo(this.ctx, {
      artist,
      track,
      username: senderRequestable,
    });

    const title = this.variationWasUsed("unlove")
      ? !trackInfo.loved
        ? "Track already not loved! ❤️‍🩹"
        : "Unloved! 💔"
      : !trackInfo.loved
      ? "Loved! ❤️"
      : "Track already loved! 💞";

    const action = this.variationWasUsed("unlove") ? "unlove" : "love";

    if (this.variationWasUsed("unlove") ? trackInfo.loved : !trackInfo.loved) {
      await this.lastFMService[action](this.ctx, {
        artist,
        track,
        username: senderRequestable,
      });
    }

    const image =
      (isNowPlaying
        ? np?.images.get("large") || parsedNp?.images.get("large")
        : trackInfo.album?.images?.get("large")) ?? undefined;

    const albumName = np?.album || trackInfo.album?.name;

    const albumCover = await this.albumCoverService.get(
      this.ctx,
      image,
      albumName
        ? {
            metadata: { artist, album: albumName },
          }
        : {}
    );

    const album = isNowPlaying
      ? np?.album || parsedNp?.album
      : trackInfo.album?.name;

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor(title))
      .setTitle(trackInfo.name)
      .setDescription(
        `by ${bold(trackInfo.artist.name)}${
          album ? ` from ${italic(album)}` : ""
        }`
      );

    if (image) embed.setThumbnail(albumCover || "");

    await this.send(embed);
  }
}
