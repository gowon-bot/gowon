import { Embed, Message } from "discord.js";
import { isBot } from "../helpers/bots";
import { BaseService } from "./BaseService";
import { RecentTrack } from "./LastFM/converters/RecentTracks";

export class NowPlayingEmbedParsingService extends BaseService {
  private readonly gowonDescriptionRegex =
    /by \*\*\[(.+)\]\(.* from _\[(.+)\]\(https:\/\//;

  private readonly fmbotDescriptionRegex =
    /\[(.*)]\(https.*\)\nBy \*\*(.*)\*\* \| \*(.*)\*/;

  private readonly emojiRegex = /<a?:\w+:\d+>/g;
  private readonly chuuDescriptionRegex = /\*\*(.*)\*\* \| (\[(.*)\]\(|(.*))/;

  private readonly linkRegex = /\[(.*)\]\(https.*\)/;
  private readonly boldOrItalicRegex = /\*?\*(.*)\*?\*/;

  hasParsableEmbed(message: Message) {
    return (
      this.hasParsableGowonEmbed(message) ||
      this.hasParsableFmbotEmbed(message) ||
      this.hasParsableChuuEmbed(message) ||
      this.hasParsableWhoKnowsEmbed(message)
    );
  }

  hasParsableGowonEmbed(message: Message) {
    return (
      isBot(message.author.id, ["gowon", "gowon development"]) &&
      message.embeds.length &&
      (message.embeds[0].author?.name?.startsWith("Now playing for") ||
        message.embeds[0].author?.name?.startsWith("Last scrobbled for") ||
        message.embeds[0].author?.name?.startsWith("Track for"))
    );
  }

  parseGowonEmbed(embed: Embed) {
    const track = embed.title!;

    const [_, artist, album] =
      embed.description?.match(this.gowonDescriptionRegex) || [];

    return this.generateTrack(artist, track, album, embed.thumbnail?.url);
  }

  hasParsableFmbotEmbed(message: Message) {
    return (
      isBot(message.author.id, ["fmbot", "fmbot develop"]) &&
      message.embeds.length &&
      (message.embeds[0].author?.name?.startsWith("Now playing ") ||
        message.embeds[0].author?.name?.startsWith("Last track for"))
    );
  }

  parseFmbotEmbed(embed: Embed) {
    const [_, track, artist, album] =
      embed.description?.match(this.fmbotDescriptionRegex) || [];

    return this.generateTrack(artist!, track!, album, embed.thumbnail?.url);
  }

  hasParsableChuuEmbed(message: Message) {
    return (
      isBot(message.author.id, ["chuu"]) &&
      message.embeds.length &&
      (message.embeds[0].author?.name?.includes("current song") ||
        message.embeds[0].author?.name?.includes("last song"))
    );
  }

  parseChuuEmbed(embed: Embed) {
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

  hasParsableWhoKnowsEmbed(message: Message) {
    return (
      isBot(message.author.id, ["who knows"]) &&
      message.embeds.length &&
      (message.embeds[0].author?.name?.startsWith("Now Playing") ||
        message.embeds[0].author?.name?.startsWith("Last Scrobbled"))
    );
  }

  parseWhoKnowsEmbed(embed: Embed) {
    const track = embed.title!;

    const [artistText, albumText] = embed.description!.split(" | ");

    const artist = this.getTextFromWhoKnowsDescriptionPart(artistText);
    const album = this.getTextFromWhoKnowsDescriptionPart(albumText);

    return this.generateTrack(artist, track, album, embed.thumbnail?.url);
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

  private getTextFromWhoKnowsDescriptionPart(part: string): string {
    const [_, linkText] = part.match(this.linkRegex) || [];

    if (linkText) {
      return linkText;
    }

    const [__, text] = part.match(this.boldOrItalicRegex) || [];

    return text!;
  }
}
