import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  keywords: new StringArgument({
    index: { start: 0 },
    description:
      "The keywords to search WhoSampled for (defaults to your currently playing track)",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class WhoSampled extends LastFMBaseCommand<typeof args> {
  idSeed = "elris hyeseong";

  aliases = ["ws"];
  description = "Search WhoSampled for a song (or anything!)";
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
      .setAuthor({ name: `WhoSampled search for "${keywords}"` })
      .setTitle("Click here to view the results")
      .setURL(`https://www.whosampled.com/search/?q=${encodedKeywords}`)
      .setThumbnail(
        "https://www.whosampled.com/static/images/press/whosampled_logo_hires.png"
      );

    await this.send(embed);
  }
}
