import { Arguments } from "../../lib/arguments/arguments";
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

  aliases = ["fml"];
  description = "Loves a track on Last.fm";
  usage = ["", "artist | track"];

  arguments: Arguments = args;

  async run() {
    let artist = this.parsedArguments.artist,
      track = this.parsedArguments.track;

    const { senderRequestable } = await this.parseMentions({
      authentificationRequired: true,
    });

    let nowPlaying: RecentTrack | undefined;

    if (!artist || !track) {
      nowPlaying = await this.lastFMService.nowPlaying(senderRequestable);

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    const trackInfo = await this.lastFMService.trackInfo({ artist, track });

    await this.lastFMService.love({
      artist,
      track,
      username: senderRequestable,
    });

    const isNowPlaying =
      nowPlaying?.artist === trackInfo.artist.name &&
      nowPlaying?.name === trackInfo.name;

    const image =
      (isNowPlaying
        ? nowPlaying?.images.get("large")
        : trackInfo.album?.images?.get("large")) ?? undefined;

    const album = isNowPlaying ? nowPlaying?.album : trackInfo.album?.name;

    const embed = this.newEmbed()
      .setAuthor("Loved! ❤️", this.author.avatarURL() || undefined)
      .setTitle(trackInfo.name.italic())
      .setDescription(
        `by ${trackInfo.artist.name.strong()}${
          album ? ` from ${album.italic()}` : ""
        }`
      );

    if (image) embed.setThumbnail(image);

    await this.send(embed);
  }
}
