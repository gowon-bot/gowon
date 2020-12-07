import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Wikipedia extends LastFMBaseCommand {
  idSeed = "elris yukyung";
  
  aliases = ["wiki"];
  description = "Search wikipedia for a song (or anything!)";
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
