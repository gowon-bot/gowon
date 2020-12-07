import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class RateYourMusic extends LastFMBaseCommand {
  idSeed = "elris bella";

  aliases = ["ryms"];
  description = "Search Rateyourmusic for an album (or anything!)";
  subcategory = "external";

  arguments: Arguments = {
    inputs: {
      keywords: { index: { start: 0 } },
    },
    mentions: standardMentions,
  };

  async run() {
    let keywords = this.parsedArguments.keywords as string;

    let { username } = await this.parseMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlayingParsed(username);

      keywords = `${nowplaying.artist} - ${nowplaying.album}`;
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
}
