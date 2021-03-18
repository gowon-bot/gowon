import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    keywords: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class RateYourMusic extends LastFMBaseCommand<typeof args> {
  idSeed = "elris bella";

  aliases = ["ryms"];
  description = "Search Rateyourmusic for an album (or anything!)";
  subcategory = "external";

  arguments: Arguments = args;

  async run() {
    let keywords = this.parsedArguments.keywords;

    let { username } = await this.parseMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlayingParsed(username);

      keywords = `${nowplaying.artist} - ${this.cleanAlbumName(
        nowplaying.album
      )}`;
    }

    let encodedKeywords = encodeURIComponent(keywords);

    let embed = this.newEmbed()
      .setAuthor(`Rateyourmusic search for "${keywords}"`)
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
  }
}
