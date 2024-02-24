import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  keywords: new StringArgument({
    index: { start: 0 },
    description:
      "The keywords to search Colorcodedlyrics for (defaults to your currently playing track)",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class ColorCodedLyrics extends LastFMBaseCommand<typeof args> {
  idSeed = "iz*one minju";

  aliases = ["ccl"];
  description = "Search colorcodedlyrics.com for an song";
  subcategory = "external";

  slashCommand = true;

  arguments = args;

  async run() {
    let keywords = this.parsedArguments.keywords;

    const { requestable } = await this.getMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      const nowplaying = await this.lastFMService.nowPlaying(
        this.ctx,
        requestable
      );

      keywords = `${nowplaying.artist} - ${nowplaying.name}`;
    }

    const embed = this.minimalEmbed()
      .setTitle(`Colorcodedlyrics search for "${keywords}"`)
      .setURL(
        `https://www.google.com/search?q=${encodeURIComponent(
          keywords
        )}+site%3Acolorcodedlyrics.com`
      )
      .setThumbnail(
        "https://i1.wp.com/colorcodedlyrics.com/wp-content/uploads/2020/05/CCL-color-logo2020.png?fit=1666%2C1189&ssl=1"
      );

    await this.reply(embed);
  }
}
