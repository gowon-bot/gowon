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
      .setTitle(`WhoSampled search for "${keywords}"`)
      .setURL(`https://www.whosampled.com/search/?q=${encodedKeywords}`)
      .setThumbnail(
        "https://www.whosampled.com/static/images/press/whosampled_logo_hires.png"
      );

    await this.reply(embed);
  }
}
