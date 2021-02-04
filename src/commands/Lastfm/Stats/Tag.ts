import { numberDisplay } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { Paginator } from "../../../lib/Paginator";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { TopArtists } from "../../../services/LastFM/LastFMService.types";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

interface Overlap {
  artist: string;
  plays: number;
}

const args = {
  inputs: {
    tag: {
      index: { start: 0 },
    },
  },
  mentions: standardMentions,
} as const;

export default class Tag extends LastFMBaseCommand<typeof args> {
  idSeed = "secret number lea";

  description =
    "Shows the overlap between your top artists, and a given tag's top artists";
  subcategory = "stats";
  usage = ["tag"];

  arguments: Arguments = args;

  validation: Validation = {
    tag: new validators.Required({}),
  };

  async run() {
    let tag = this.parsedArguments.tag!;

    let { username, perspective } = await this.parseMentions({
      asCode: false,
    });

    let paginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      2,
      { username, limit: 1000 }
    );

    let [tagTopArtists, userTopArtists] = await Promise.all([
      this.lastFMService.tagTopArtists({ tag, limit: 1000 }),
      paginator.getAll<TopArtists>({ concatTo: "artist", concurrent: false }),
    ]);

    let tagArtistNames = tagTopArtists!.artist.map((a) =>
      a.name.toLowerCase().replace(/\s+/g, "-")
    );

    let overlap = this.calculateOverlap(userTopArtists, tagArtistNames);

    let embed = this.newEmbed()
      .setAuthor(this.author.username, this.author.avatarURL() || "")
      .setTitle(
        `${perspective.upper.possessive} top ${
          tagTopArtists!["@attr"].tag
        } artists`
      )
      .setDescription(
        `
_Comparing ${perspective.possessive} top ${numberDisplay(
          userTopArtists.artist.length,
          "artist"
        )} and the top ${numberDisplay(
          tagArtistNames.length,
          "artist"
        )} of the tag_\n` +
          (overlap.length
            ? `${numberDisplay(overlap.length, "artist")} (${calculatePercent(
                overlap.length,
                tagArtistNames.length
              )}% match) (${numberDisplay(
                overlap.reduce((sum, o) => sum + o.plays, 0),
                "scrobble"
              )})\n\n` +
              `${overlap
                .slice(0, 20)
                .map(
                  (o, idx) =>
                    `${idx + 1}. ${o.artist.strong()} - ${numberDisplay(
                      o.plays,
                      "play"
                    )}`
                )
                .join("\n")}
`
            : "Couldn't find any matching artists!")
      );

    await this.send(embed);
  }

  calculateOverlap(
    userTopArtists: TopArtists,
    tagArtistNames: string[]
  ): Overlap[] {
    return userTopArtists.artist.reduce((acc, a) => {
      if (tagArtistNames.includes(a.name.toLowerCase().replace(/\s+/g, "-")))
        acc.push({
          artist: a.name,
          plays: a.playcount.toInt(),
        });

      return acc;
    }, [] as Overlap[]);
  }
}
