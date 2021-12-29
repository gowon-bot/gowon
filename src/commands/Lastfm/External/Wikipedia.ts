import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    keywords: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class Wikipedia extends LastFMBaseCommand<typeof args> {
  idSeed = "elris yukyung";

  aliases = ["wiki"];
  description = "Search wikipedia for a song (or anything!)";
  subcategory = "external";

  arguments: Arguments = args;

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
      .setAuthor(`Wikipedia search for "${keywords}"`)
      .setTitle("Click here to view the results")
      .setURL(`https://en.wikipedia.org/w/index.php?search=${encodedKeywords}`)
      .setThumbnail(
        "https://upload.wikimedia.org/wikipedia/commons/5/53/Wikipedia-logo-en-big.png"
      );

    await this.send(embed);
  }
}
