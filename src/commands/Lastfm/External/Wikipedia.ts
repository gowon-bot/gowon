import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  keywords: new StringArgument({
    index: { start: 0 },
    description:
      "The keywords to search Wikipedia for (defaults to your currently playing track)",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class Wikipedia extends LastFMBaseCommand<typeof args> {
  idSeed = "elris yukyung";

  aliases = ["wiki"];
  description = "Search Wikipedia for a song (or anything!)";
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

    const encodedKeywords = encodeURIComponent(keywords);

    const embed = this.minimalEmbed()
      .setTitle(`Wikipedia search for "${keywords}"`)
      .setURL(`https://en.wikipedia.org/w/index.php?search=${encodedKeywords}`)
      .setThumbnail(
        "https://upload.wikimedia.org/wikipedia/commons/5/53/Wikipedia-logo-en-big.png"
      );

    await this.reply(embed);
  }
}
