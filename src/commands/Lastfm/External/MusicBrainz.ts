import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  keywords: new StringArgument({ index: { start: 0 } }),
  searchArtists: new Flag({
    description: "Search artists",
    longnames: ["artist"],
    shortnames: ["a"],
  }),
} as const;

export default class MusicBrainz extends LastFMBaseCommand<typeof args> {
  idSeed = "dreamnote youi";

  aliases = ["mb", "mbz"];
  description = "Search musicbrainz for a release (or artist with -a!)";
  subcategory = "external";

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

      keywords = `${nowplaying.artist} - ${nowplaying.album}`;
    }

    let encodedKeywords = encodeURIComponent(keywords);

    let embed = this.newEmbed()
      .setAuthor({ name: `MusicBrainz search for "${keywords}"` })
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
