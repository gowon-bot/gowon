import { EmbedBuilder, GuildMember, HexColorString, User } from "discord.js";
import { ucFirst } from "../../../helpers";
import { bold, italic } from "../../../helpers/discord";
import { ImageCollection } from "../../../services/LastFM/converters/BaseConverter";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { AlbumCoverService } from "../../../services/moderation/AlbumCoverService";
import { GowonContext } from "../../context/Context";
import { displayUserTag } from "../displays";

export const errorColour = "#ED008E";

export function gowonEmbed(member?: GuildMember, embed?: EmbedBuilder) {
  const gowonEmbed = (embed || new EmbedBuilder()).setColor(
    (member?.roles?.color?.hexColor as HexColorString) || "#000000"
  );

  return gowonEmbed;
}

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
): Promise<EmbedBuilder> {
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

  return new EmbedBuilder()
    .setTitle(track.name)
    .setDescription(
      `by ${bold(artist)}` + (album ? ` from ${italic(album)}` : "")
    )
    .setThumbnail(albumCover || "");
}

export function errorEmbed(
  from: EmbedBuilder,
  author: User,
  member: GuildMember | undefined,
  message: string,
  footer: string = ""
): EmbedBuilder {
  return from
    .setColor(errorColour)
    .setAuthor({
      name: `Error | ${displayUserTag(author)}`,
      iconURL: member?.avatarURL() || author.avatarURL() || undefined,
    })
    .setDescription(ucFirst(message))
    .setFooter({ text: footer });
}
