import { Message, MessageEmbed } from "discord.js";
import { BaseService, BaseServiceContext } from "./BaseService";
import { RecentTrack } from "./LastFM/converters/RecentTracks";

export class NowPlayingEmbedParsingService extends BaseService {
  private readonly gowonDescriptionRegex =
    /by \*\*\[(.+)\]\(.* from _\[(.+)\]\(https:\/\//;

  private readonly fmbotDescriptionRegex =
    /\[(.*)]\(https.*\)\nBy \*\*(.*)\*\* \| \*(.*)\*/;

  private readonly emojiRegex = /<a?:\w+:\d+>/g;
  private readonly chuuDescriptionRegex = /\*\*(.*)\*\* \| (\[(.*)\]\(|(.*))/;

  hasParsableEmbed(ctx: BaseServiceContext, message: Message) {
    return (
      this.hasParsableGowonEmbed(ctx, message) ||
      this.hasParsableFmbotEmbed(ctx, message) ||
      this.hasParsableChuuEmbed(ctx, message)
    );
  }

  hasParsableGowonEmbed(ctx: BaseServiceContext, message: Message) {
    return (
      ctx.client.isBot(message.author.id, ["gowon", "gowon development"]) &&
      message.embeds.length &&
      (message.embeds[0].author?.name?.startsWith("Now playing for") ||
        message.embeds[0].author?.name?.startsWith("Last scrobbled for"))
    );
  }

  parseGowonEmbed(embed: MessageEmbed) {
    const track = embed.title!;

    const [_, artist, album] =
      embed.description?.match(this.gowonDescriptionRegex) || [];

    return this.generateTrack(artist, track, album, embed.thumbnail?.url);
  }

  hasParsableFmbotEmbed(ctx: BaseServiceContext, message: Message) {
    return (
      ctx.client.isBot(message.author.id, ["fmbot", "fmbot develop"]) &&
      message.embeds.length &&
      (message.embeds[0].author?.name?.startsWith("Now playing ") ||
        message.embeds[0].author?.name?.startsWith("Last track for"))
    );
  }

  parseFmbotEmbed(embed: MessageEmbed) {
    const [_, track, artist, album] =
      embed.description?.match(this.fmbotDescriptionRegex) || [];

    return this.generateTrack(artist!, track!, album, embed.thumbnail?.url);
  }

  hasParsableChuuEmbed(ctx: BaseServiceContext, message: Message) {
    return (
      ctx.client.isBot(message.author.id, ["chuu"]) &&
      message.embeds.length &&
      (message.embeds[0].author?.name?.includes("current song") ||
        message.embeds[0].author?.name?.includes("last song"))
    );
  }

  parseChuuEmbed(embed: MessageEmbed) {
    const cleanTitle = embed.title?.replaceAll(this.emojiRegex, "")!;
    const cleanDescription = embed.description?.replaceAll(
      this.emojiRegex,
      ""
    )!;

    const [_, artist, __, album1, album2] =
      cleanDescription.match(this.chuuDescriptionRegex) || [];

    return this.generateTrack(
      artist,
      cleanTitle,
      album1 || album2,
      embed.thumbnail?.url
    );
  }

  private generateTrack(
    artist: string,
    track: string,
    album?: string,
    image?: string
  ): RecentTrack {
    return new RecentTrack({
      artist: { "#text": artist.trim().replaceAll(/\\(?=[^\\])/g, "") },
      album: { "#text": album?.trim().replaceAll(/\\(?=[^\\])/g, "") || "" },
      name: track.trim(),
      image: image ? [{ size: "large", "#text": image }] : [],
    } as any);
  }
}
