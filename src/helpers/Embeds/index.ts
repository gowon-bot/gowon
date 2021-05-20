import { GuildMember, MessageEmbed } from "discord.js";
import { ImageCollection } from "../../services/LastFM/converters/BaseConverter";

export function GowonEmbed(member?: GuildMember, embed?: MessageEmbed) {
  let gowonEmbed = (embed || new MessageEmbed()).setColor(
    member?.roles?.color?.hexColor || "black"
  );

  return gowonEmbed;
}

interface SimpleTrack {
  name: string;
  artist: string | { name: string };
  album: string | { name: string };
  images: ImageCollection;
}

export function TrackEmbed(
  track: SimpleTrack,
  imageSize = "large"
): MessageEmbed {
  let artist =
    typeof track.artist === "string" ? track.artist : track.artist.name;
  let album = typeof track.album === "string" ? track.album : track.album.name;

  return new MessageEmbed()
    .setTitle(track.name)
    .setDescription(
      `by ${artist.strong()}` + (album ? ` from ${album.italic()}` : "")
    )
    .setThumbnail(track.images.get(imageSize) || "");
}
