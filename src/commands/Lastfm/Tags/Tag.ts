import gql from "graphql-tag";
import { calculatePercent } from "../../../helpers/stats";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { Paginator } from "../../../lib/paginators/Paginator";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { TopArtists } from "../../../services/LastFM/converters/TopTypes";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

interface Overlap {
  artist: string;
  plays: number;
}

const args = {
  tag: new StringArgument({
    index: { start: 0 },
    required: true,
    description: "The tag to filter your artists with",
  }),
  ...standardMentions,
} as const;

export default class Tag extends LastFMBaseCommand<typeof args> {
  idSeed = "secret number lea";

  description =
    "Shows the overlap between your top artists, and a given tag's top artists";
  subcategory = "tags";
  usage = ["tag"];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    tag: new validators.Required({}),
  };

  async run() {
    const tag = this.parsedArguments.tag;

    const { requestable, perspective } = await this.getMentions({
      asCode: false,
    });

    const paginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      2,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const [tagTopArtists, userTopArtists, mirrorballArtists] =
      await Promise.all([
        this.lastFMService.tagTopArtists(this.ctx, { tag, limit: 1000 }),
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

    const description =
      `_Comparing ${perspective.possessive} top ${displayNumber(
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
          )})\n\n`
        : "Couldn't find any matching artists!");

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor())
      .setTitle(
        `${perspective.upper.possessive} top ${tagTopArtists.meta.tag} artists`
      );

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: overlap,
      pageSize: 20,
      pageRenderer(overlap, { offset }) {
        return (
          description +
          displayNumberedList(
            overlap.map(
              (o) => `${o.artist.strong()} - ${displayNumber(o.plays, "play")}`
            ),
            offset
          )
        );
      },
      overrides: { itemName: "artist" },
    });

    scrollingEmbed.send();
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

    const response = await this.mirrorballService.query<{
      artists: { name: string }[];
    }>(this.ctx, query, { tag });

    return response.artists;
  }

  private artistNameTransform(a: { name: string }) {
    return a.name.toLowerCase().replace(/\s+/g, "-");
  }
}
