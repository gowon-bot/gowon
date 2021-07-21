import gql from "graphql-tag";
import { calculatePercent } from "../../../helpers/stats";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { mirrorballClient } from "../../../lib/indexing/client";
import { Paginator } from "../../../lib/Paginator";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayNumber } from "../../../lib/views/displays";
import { TopArtists } from "../../../services/LastFM/converters/TopTypes";
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
  subcategory = "tags";
  usage = ["tag"];

  arguments: Arguments = args;

  validation: Validation = {
    tag: new validators.Required({}),
  };

  async run() {
    const tag = this.parsedArguments.tag!;

    const { requestable, perspective } = await this.parseMentions({
      asCode: false,
    });

    const paginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      2,
      { username: requestable, limit: 1000 }
    );

    const [tagTopArtists, userTopArtists, mirrorballArtists] =
      await Promise.all([
        this.lastFMService.tagTopArtists({ tag, limit: 1000 }),
        paginator.getAllToConcatonable({
          concurrent: false,
        }),
        this.mirrorballArtists(tag),
      ]);

    const tagArtistNames = new Set([
      ...tagTopArtists!.artists.map(this.artistNameTransform),
      ...mirrorballArtists.map(this.artistNameTransform),
    ]);

    const overlap = this.calculateOverlap(userTopArtists, tagArtistNames);

    const embed = this.newEmbed()
      .setAuthor(this.author.username, this.author.avatarURL() || "")
      .setTitle(
        `${perspective.upper.possessive} top ${tagTopArtists.meta.tag} artists`
      )
      .setDescription(
        `
_Comparing ${perspective.possessive} top ${displayNumber(
          userTopArtists.artists.length,
          "artist"
        )} and the top ${displayNumber(
          tagArtistNames.size,
          "artist"
        )} of the tag_\n` +
          (overlap.length
            ? `${displayNumber(overlap.length, "artist")} (${calculatePercent(
                overlap.length,
                tagArtistNames.size
              )}% match) (${displayNumber(
                overlap.reduce((sum, o) => sum + o.plays, 0),
                "scrobble"
              )})\n\n` +
              `${overlap
                .slice(0, 20)
                .map(
                  (o, idx) =>
                    `${idx + 1}. ${o.artist.strong()} - ${displayNumber(
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
    tagArtistNames: Set<string>
  ): Overlap[] {
    return userTopArtists.artists.reduce((acc, a) => {
      if (tagArtistNames.has(a.name.toLowerCase().replace(/\s+/g, "-"))) {
        acc.push({
          artist: a.name,
          plays: a.userPlaycount,
        });
      }

      return acc;
    }, [] as Overlap[]);
  }

  private async mirrorballArtists(tag: string): Promise<{ name: string }[]> {
    const query = gql`
      query artists($tag: String!) {
        artists(tag: { name: $tag }) {
          name
        }
      }
    `;

    const response = await mirrorballClient.query<{
      artists: { name: string }[];
    }>({
      query,
      variables: { tag },
    });

    return response.data.artists;
  }

  private artistNameTransform(a: { name: string }) {
    return a.name.toLowerCase().replace(/\s+/g, "-");
  }
}
