import { bold } from "../../../helpers/discord";
import { calculatePercent } from "../../../helpers/stats";
import { CommandRedirect } from "../../../lib/command/Command";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Paginator } from "../../../lib/paginators/Paginator";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { TopArtists } from "../../../services/LastFM/converters/TopTypes";
import { LilacArtistsService } from "../../../services/lilac/LilacArtistsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { TagBlacklistService } from "../../../services/TagBlacklistService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import ArtistTags from "./ArtistTags";

interface Overlap {
  artist: string;
  plays: number;
}

const args = {
  tag: new StringArgument({
    index: { start: 0 },
    description: "The tag to filter your artists with",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class Tag extends LastFMBaseCommand<typeof args> {
  idSeed = "secret number lea";

  description =
    "Shows the overlap between your top artists, and a given tag's top artists";
  subcategory = "tags";
  usage = ["tag"];

  arguments = args;

  slashCommand = true;

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => !args.tag,
      redirectTo: ArtistTags,
    },
  ];

  lilacArtistsService = ServiceRegistry.get(LilacArtistsService);
  tagBlacklistService = ServiceRegistry.get(TagBlacklistService);

  async run() {
    const tag = this.parsedArguments.tag!;

    await this.tagBlacklistService.saveServerBannedTagsInContext(this.ctx);

    this.tagBlacklistService.throwIfTagNotAllowedAsInput(this.ctx, tag);

    const { requestable, perspective } = await this.getMentions({
      perspectiveAsCode: false,
    });

    const paginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      2,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const [tagTopArtists, userTopArtists, lilacArtists] = await Promise.all([
      this.lastFMService.tagTopArtists(this.ctx, { tag, limit: 1000 }),
      paginator.getAllToConcatonable({
        concurrent: false,
      }),
      this.lilacArtistsService.listWithTags(this.ctx, {
        tags: [{ name: tag }],
      }),
    ]);

    const tagArtistNames = new Set([
      ...tagTopArtists!.artists.map(this.artistNameTransform),
      ...lilacArtists.artists.artists.map(this.artistNameTransform),
    ]);

    const overlap = this.calculateOverlap(userTopArtists, tagArtistNames);

    const similarTags = lilacArtists.tags.tags
      .filter((t) => t.name.toLowerCase() !== tag.toLowerCase())
      .map((t) => t.name.toLowerCase());

    const description =
      (similarTags.length > 3
        ? `_Including ${displayNumber(similarTags.length, "similar tag")}_\n`
        : similarTags.length == 2
        ? `_Including ${similarTags[0]} & ${similarTags[1]}_\n`
        : similarTags.length > 0
        ? `_Including ${similarTags.join(", ")}_\n`
        : "") +
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
      .setAuthor(this.generateEmbedAuthor("Tags"))
      .setTitle(
        `${perspective.upper.possessive} top ${tagTopArtists.meta.tag} artists`
      );

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: overlap,
      pageSize: 15,
      pageRenderer(overlap, { offset }) {
        return (
          description +
          displayNumberedList(
            overlap.map(
              (o) => `${bold(o.artist)} - ${displayNumber(o.plays, "play")}`
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

  private artistNameTransform(a: { name: string }) {
    return a.name.toLowerCase().replace(/\s+/g, "-");
  }
}
