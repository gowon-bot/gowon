import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { RateYourMusicChildCommand } from "./RateYourMusicChildCommand";

const args = {
  keywords: new StringArgument({
    index: { start: 0 },
    description:
      "The keywords to search Rateyourmusic with (defaults to your currently playing album)",
  }),
  ...standardMentions,
} as const;

export class Link extends RateYourMusicChildCommand<typeof args> {
  idSeed = "elris bella";
  description = "Search Rateyourmusic for an album (or anything!)";
  slashCommand = true;

  arguments = args;

  async run() {
    let keywords = this.parsedArguments.keywords;

    const { requestable } = await this.getMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      const { artist, album } = await this.lastFMArguments.getAlbum(
        this.ctx,
        requestable,
        { noSearch: true }
      );

      if (artist && album) {
        keywords = `${artist} - ${this.cleanAlbumName(album)}`;
      } else {
        keywords = `${artist}`;
      }
    }

    const encodedKeywords = encodeURIComponent(keywords);

    const embed = this.newEmbed()
      .setAuthor(
        this.generateEmbedAuthor(`Rateyourmusic search for "${keywords}"`)
      )
      .setTitle("Click here to view the results")
      .setURL(
        `https://www.google.com/search?q=${encodedKeywords}+site%3Arateyourmusic.com`
      )
      .setThumbnail("https://e.snmc.io/3.0/img/logo/sonemic-512.png");

    await this.send(embed);
  }

  private cleanAlbumName(albumName: string): string {
    const cleaned = albumName.replace(
      /(\s?(-|–)\s?)?(The )?((\d+\w{2})|(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth)) (Mini )?Album( Repackage)?/gi,
      ""
    );

    if (cleaned === "") return albumName;
    return cleaned;
  }
}
