import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  keywords: new StringArgument({
    index: { start: 0 },
    description:
      "The keywords to search Colorcodedlyrics for (defaults to your currently playing track)",
  }),
  ...standardMentions,
} as const;

export default class ColorCodedLyrics extends LastFMBaseCommand<typeof args> {
  idSeed = "iz*one minju";

  aliases = ["ccl"];
  description = "Search colorcodedlyrics.com for an song";
  subcategory = "external";

  slashCommand = true;

  arguments = args;

  async run() {
    let keywords = this.parsedArguments.keywords;

    let { requestable } = await this.getMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlaying(
        this.ctx,
        requestable
      );

      keywords = `${nowplaying.artist} - ${nowplaying.name}`;
    }

    let encodedKeywords = encodeURIComponent(keywords);

    let embed = this.newEmbed()
      .setAuthor({ name: `Colorcodedlyrics search for "${keywords}"` })
      .setTitle("Click here to view the results")
      .setURL(
        `https://www.google.com/search?q=${encodedKeywords}+site%3Acolorcodedlyrics.com`
      )
      .setThumbnail(
        "https://i1.wp.com/colorcodedlyrics.com/wp-content/uploads/2020/05/CCL-color-logo2020.png?fit=1666%2C1189&ssl=1"
      );

    await this.send(embed);
  }
}
