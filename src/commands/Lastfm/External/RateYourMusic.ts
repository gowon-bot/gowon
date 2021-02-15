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

      keywords = `${nowplaying.artist}" "${nowplaying.album}`;
    }

    let encodedKeywords = encodeURIComponent(keywords);

    let embed = this.newEmbed()
      .setAuthor(`Rateyourmusic search for "${keywords}"`)
      .setTitle("Click here to view the results")
      .setURL(
        // https://duckduckgo.com/?q=%5Csite%3Arateyourmusic.com+%22How+The+Dogs+Chill%2c+Vol.+1%22+%22MALL+GRAB%22
        `https://duckduckgo.com/?q=%5Csite%3Arateyourmusic.com+%22${encodedKeywords}%22`
      )
      .setThumbnail("https://e.snmc.io/3.0/img/logo/sonemic-512.png");

    await this.send(embed);
  }
}
