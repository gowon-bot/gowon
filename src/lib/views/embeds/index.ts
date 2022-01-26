import { GuildMember, HexColorString, MessageEmbed, User } from "discord.js";
import { ucFirst } from "../../../helpers";
import { ImageCollection } from "../../../services/LastFM/converters/BaseConverter";

export const errorColour = "#ED008E";

export function gowonEmbed(member?: GuildMember, embed?: MessageEmbed) {
  const gowonEmbed = (embed || new MessageEmbed()).setColor(
    (member?.roles?.color?.hexColor as HexColorString) || "black"
  );

  return gowonEmbed;
}

interface SimpleTrack {
  name: string;
  artist: string | { name: string };
  album: string | { name: string };
  images: ImageCollection;
}

export function trackEmbed(
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

export function errorEmbed(
  from: MessageEmbed,
  author: User,
  message: string,
  footer: string = ""
): MessageEmbed {
  return from
    .setColor(errorColour)
    .setAuthor({
      name: `Error | ${author.username}#${author.discriminator}`,
      iconURL: author.avatarURL() ?? undefined,
    })
    .setDescription(ucFirst(message))
    .setFooter({ text: footer });
}
