import { MessageEmbed } from "discord.js";
import { bold, italic } from "../../../helpers/discord";
import { ImageCollection } from "../../../services/LastFM/converters/BaseConverter";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { AlbumCoverService } from "../../../services/moderation/AlbumCoverService";
import { GowonContext } from "../../context/Context";

interface SimpleTrack {
  name: string;
  artist: string | { name: string };
  album: string | { name: string };
  images: ImageCollection;
}

export async function trackEmbed(
  ctx: GowonContext,
  track: SimpleTrack,
  imageSize = "large"
): Promise<MessageEmbed> {
  const artist =
    typeof track.artist === "string" ? track.artist : track.artist.name;
  const album =
    typeof track.album === "string" ? track.album : track.album.name;

  const albumCover = await ServiceRegistry.get(AlbumCoverService).get(
    ctx,
    track.images.get(imageSize),
    {
      metadata: { artist, album },
    }
  );

  return new MessageEmbed()
    .setTitle(track.name)
    .setDescription(
      `by ${bold(artist)}` + (album ? ` from ${italic(album)}` : "")
    )
    .setThumbnail(albumCover || "");
}
