//

import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    keywords: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class Melon extends LastFMBaseCommand<typeof args> {
  idSeed = "bvndit simyeong";

  aliases = ["mel"];
  description = "Search melon for an artist's albums";
  subcategory = "external";

  arguments: Arguments = args;

  async run() {
    let keywords = this.parsedArguments.keywords;

    let { username } = await this.parseMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlayingParsed(username);

      keywords = `${nowplaying.artist}`;
    }

    let encodedKeywords = encodeURIComponent(keywords);

    let embed = this.newEmbed()
      .setAuthor(`Melon search for "${keywords}"`)
      .setTitle("Click here to view the results")
      .setURL(
        `https://www.melon.com/search/album/index.htm?q=${encodedKeywords}&section=&searchGnbYn=Y&kkoSpl=N&kkoDpType=&ipath=srch_form`
      )
      .setThumbnail(
        "https://upload.wikimedia.org/wikipedia/commons/c/c5/Melon_logo.png"
      );

    await this.send(embed);
  }
}
