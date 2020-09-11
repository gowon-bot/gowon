import { MessageEmbed } from "discord.js";
import { Image } from "../../services/LastFM/LastFMService.types";

interface SimpleTrack {
  name: string;
  artist: { "#text"?: string; name?: string; title?: string };
  album: { "#text"?: string; name?: string; title?: string };
  image: Image[];
}

export function TrackEmbed(
  track: SimpleTrack,
  imageSize = "large"
): MessageEmbed {
  let artist =
    track.artist.name || track.artist["#text"] || track.artist.title || "";
  let album =
    track.album.name || track.album["#text"] || track.album.title || "";

  return new MessageEmbed()
    .setTitle(track.name)
    .setDescription(
      `by ${artist.bold()}` + (album ? ` from ${album.italic()}` : "")
    )
    .setThumbnail(
      track.image.find((i) => i.size === imageSize)?.["#text"] || ""
    );
}
