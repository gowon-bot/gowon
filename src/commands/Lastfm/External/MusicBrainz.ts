import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    keywords: { index: { start: 0 } },
  },
  mentions: standardMentions,
  flags: {
    searchArtists: {
      description: "Search artists",
      longnames: ["artist"],
      shortnames: ["a"],
    },
  },
} as const;

export default class MusicBrainz extends LastFMBaseCommand<typeof args> {
  idSeed = "dreamnote youi";

  aliases = ["mb", "mbz"];
  description = "Search musicbrainz for a release (or artist with -a!)";
  subcategory = "external";

  arguments: Arguments = args;

  async run() {
    let keywords = this.parsedArguments.keywords;

    let { requestable } = await this.parseMentions({
      usernameRequired: !keywords,
    });

    if (!keywords) {
      let nowplaying = await this.lastFMService.nowPlaying(requestable);

      keywords = `${nowplaying.artist} - ${nowplaying.album}`;
    }

    let encodedKeywords = encodeURIComponent(keywords);

    let embed = this.newEmbed()
      .setAuthor(`Music search for "${keywords}"`)
      .setTitle("Click here to view the results")
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
