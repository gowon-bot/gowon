import { Arguments } from "../../lib/arguments/arguments";
import { Variation } from "../../lib/command/BaseCommand";
import { RecentTrack } from "../../services/LastFM/converters/RecentTracks";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
} as const;

export default class Love extends LastFMBaseCommand<typeof args> {
  idSeed = "shasha i an";

  description = "Loves a track on Last.fm";
  usage = ["", "artist | track"];

  variations: Variation[] = [{ name: "unlove", variation: ["unlove", "hate"] }];

  arguments: Arguments = args;

  async run() {
    const { senderRequestable } = await this.parseMentions({
      authentificationRequired: true,
    });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable
    );

    const np = this.ctx.nowplaying as RecentTrack | undefined;
    const parsedNp = this.ctx.parsedNowplaying as RecentTrack | undefined;

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

    const album = isNowPlaying
      ? np?.album || parsedNp?.album
      : trackInfo.album?.name;

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor(title))
      .setTitle(trackInfo.name)
      .setDescription(
        `by ${trackInfo.artist.name.strong()}${
          album ? ` from ${album.italic()}` : ""
        }`
      );

    if (image) embed.setThumbnail(image);

    await this.send(embed);
  }
}
