import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  keywords: new StringArgument({
    index: { start: 0 },
    description:
      "The keywords to search Wikipedia for (defaults to your currently playing track)",
  }),
  ...standardMentions,
} as const;

export default class Wikipedia extends LastFMBaseCommand<typeof args> {
  idSeed = "elris yukyung";

  aliases = ["wiki"];
  description = "Search Wikipedia for a song (or anything!)";
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
      .setAuthor({ name: `Wikipedia search for "${keywords}"` })
      .setTitle("Click here to view the results")
      .setURL(`https://en.wikipedia.org/w/index.php?search=${encodedKeywords}`)
      .setThumbnail(
        "https://upload.wikimedia.org/wikipedia/commons/5/53/Wikipedia-logo-en-big.png"
      );

    await this.send(embed);
  }
}
