import { GuildMember, HexColorString, MessageEmbed, User } from "discord.js";
import { ClientError } from "../../../errors/errors";
import { bold, italic } from "../../../helpers/discord";
import { uppercaseFirstLetter } from "../../../helpers/string";
import { ImageCollection } from "../../../services/LastFM/converters/BaseConverter";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { AlbumCoverService } from "../../../services/moderation/AlbumCoverService";
import { GowonContext } from "../../context/Context";
import { Emoji } from "../../emoji/Emoji";
import { displayUserTag } from "../displays";

export const errorColour = "#F1759A";
export const warningColour = "#FCCA28";
export const infoColour = "#02BCA1";

enum ConditionEmbedType {
  Info = "info",
  Warning = "warning",
  Error = "error",
}

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

export function errorEmbed(
  from: MessageEmbed,
  author: User,
  member: GuildMember | undefined,
  error: Error
): MessageEmbed {
  const footer = error instanceof ClientError ? error.footer : "";
  const isWarning = error instanceof ClientError ? error.isWarning : false;

  return baseConditionEmbed(
    isWarning ? ConditionEmbedType.Warning : ConditionEmbedType.Error,
    from,
    author,
    member,
    uppercaseFirstLetter(error.message),
    footer
  );
}

export function infoEmbed(
  from: MessageEmbed,
  author: User,
  member: GuildMember | undefined,
  message: string,
  footer?: string
): MessageEmbed {
  return baseConditionEmbed(
    ConditionEmbedType.Info,
    from,
    author,
    member,
    message,
    footer
  );
}

function baseConditionEmbed(
  type: ConditionEmbedType,
  from: MessageEmbed,
  author: User,
  member: GuildMember | undefined,
  message: string,
  footer?: string
) {
  return from
    .setColor(
      type === ConditionEmbedType.Error
        ? errorColour
        : type === ConditionEmbedType.Info
        ? infoColour
        : type === ConditionEmbedType.Warning
        ? warningColour
        : "#000000"
    )
    .setAuthor({
      name: `${uppercaseFirstLetter(type)} | ${displayUserTag(author)}`,
      iconURL: member?.avatarURL() || author.avatarURL() || undefined,
    })
    .setDescription(
      `${
        type === ConditionEmbedType.Error
          ? Emoji.error
          : type === ConditionEmbedType.Info
          ? Emoji.info
          : type === ConditionEmbedType.Warning
          ? Emoji.warning
          : ""
      } ${uppercaseFirstLetter(message)}`
    )
    .setFooter({ text: footer ?? "" });
}
