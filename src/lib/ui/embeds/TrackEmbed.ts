import { bold, italic } from "../../../helpers/discord";
import { ImageCollection } from "../../../services/LastFM/converters/BaseConverter";
import { Image } from "../Image";
import { EmbedView } from "../views/EmbedView";
import { View } from "../views/View";

export interface SimpleTrack {
  name: string;
  artist: string | { name: string };
  album: string | { name: string };
  images: ImageCollection;
}

export function getSimpleTrackDetails(track: SimpleTrack): {
  artist: string;
  album: string;
} {
  const artist =
    typeof track.artist === "string" ? track.artist : track.artist.name;
  const album =
    typeof track.album === "string" ? track.album : track.album.name;

  return { artist, album };
}

export class TrackEmbed extends View {
  private track!: SimpleTrack;
  private albumCover?: Image;
  private additionalDescription?: string;

  constructor(private baseEmbed: EmbedView = new EmbedView()) {
    super();
  }

  asDiscordSendable(): EmbedView {
    const { artist, album } = getSimpleTrackDetails(this.track);

    return this.baseEmbed
      .setTitle(this.track.name)
      .setDescription(
        `by ${bold(artist)}` + (album ? ` from ${italic(album)}` : "")
      )
      .addDescription(this.additionalDescription || "")
      .setThumbnail(this.albumCover);
  }

  setTrack(track: SimpleTrack): this {
    this.track = track;
    return this;
  }

  setAlbumCover(albumCover?: Image): this {
    this.albumCover = albumCover;
    return this;
  }

  addDescription(description: string): this {
    this.additionalDescription = (
      (this.additionalDescription || "") + description
    ).trim();

    return this;
  }
}
