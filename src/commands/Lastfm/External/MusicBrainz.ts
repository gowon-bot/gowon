import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  keywords: new StringArgument({
    index: { start: 0 },
    description:
      "The keywords to search MusicBrainz for (defaults to your currently playing track/artist)",
  }),
  searchArtists: new Flag({
    description: "Search artists instead of releases",
    longnames: ["artist"],
    shortnames: ["a"],
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class MusicBrainz extends LastFMBaseCommand<typeof args> {
  idSeed = "dreamnote youi";

  aliases = ["mb", "mbz"];
  description = "Search musicbrainz for a release";
  subcategory = "external";

  slashCommand = true;

  arguments = args;

  async run() {
    let keywords = this.parsedArguments.keywords;

    const { requestable } = await this.getMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlaying(
        this.ctx,
        requestable
      );

      keywords = this.parsedArguments.searchArtists
        ? nowplaying.artist
        : `${nowplaying.artist} - ${nowplaying.album}`;
    }

    const encodedKeywords = encodeURIComponent(keywords);

    const embed = this.authorEmbed()
      .setHeader("MusicBrainz search")
      .setTitle(`MusicBrainz search for "${keywords}"`)
      .setURL(
        `https://musicbrainz.org/search?query=${encodedKeywords}&type=${
          this.parsedArguments.searchArtists ? "artist" : "release"
        }&method=indexed`
      )
      .setThumbnail(
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/MusicBrainz_Logo_%282016%29.svg/1200px-MusicBrainz_Logo_%282016%29.svg.png"
      );

    await this.send(embed);
  }
}
