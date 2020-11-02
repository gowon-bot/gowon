import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class WhoSampled extends LastFMBaseCommand {
  aliases = ["ws"];
  description = "Search WhoSampled for a song (or anything!)";
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
      .setAuthor(`WhoSampled search for "${keywords}"`)
      .setTitle("Click here to view the results")
      .setURL(`https://www.whosampled.com/search/?q=${encodedKeywords}`)
      .setThumbnail(
        "https://www.whosampled.com/static/images/press/whosampled_logo_hires.png"
      );

    await this.send(embed);
  }
}