import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  keywords: new StringArgument({ index: { start: 0 } }),
} as const;

export default class WhoSampled extends LastFMBaseCommand<typeof args> {
  idSeed = "elris hyeseong";

  aliases = ["ws"];
  description = "Search WhoSampled for a song (or anything!)";
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

      keywords = `${nowplaying.artist} - ${nowplaying.name}`;
    }

    let encodedKeywords = encodeURIComponent(keywords);

    let embed = this.newEmbed()
      .setAuthor({ name: `WhoSampled search for "${keywords}"` })
      .setTitle("Click here to view the results")
      .setURL(`https://www.whosampled.com/search/?q=${encodedKeywords}`)
      .setThumbnail(
        "https://www.whosampled.com/static/images/press/whosampled_logo_hires.png"
      );

    await this.send(embed);
  }
}
