import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  keywords: new StringArgument({ index: { start: 0 } }),
} as const;

export default class Melon extends LastFMBaseCommand<typeof args> {
  idSeed = "bvndit simyeong";

  aliases = ["mel"];
  description = "Search melon for an artist's albums";
  subcategory = "external";

  arguments = args;

  async run() {
    let keywords = this.parsedArguments.keywords;

    let { requestable } = await this.parseMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlaying(
        this.ctx,
        requestable
      );

      keywords = `${nowplaying.artist}`;
    }

    let encodedKeywords = encodeURIComponent(keywords);

    let embed = this.newEmbed()
      .setAuthor({ name: `Melon search for "${keywords}"` })
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
