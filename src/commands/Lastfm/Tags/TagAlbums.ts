import { bold, italic } from "../../../helpers/discord";
import { calculatePercent } from "../../../helpers/stats";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Paginator } from "../../../lib/paginators/Paginator";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { TopAlbums } from "../../../services/LastFM/converters/TopTypes";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { TagBlacklistService } from "../../../services/moderation/TagBlacklistService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

interface Overlap {
  album: string;
  artist: string;
  plays: number;
}

const args = {
  tag: new StringArgument({
    index: { start: 0 },
    required: true,
    description: "The tag to filter your albums with",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class TagAlbums extends LastFMBaseCommand<typeof args> {
  idSeed = "brave girls minyoung";

  description =
    "Shows the overlap between your top albums, and a given tag's top albums.";
  extraDescription =
    " This command works best for smaller/joke tags, as a lot of larger tags are mistagged";
  subcategory = "tags";
  aliases = ["tagl", "tagal", "tagalbum"];
  usage = ["tag"];

  arguments = args;

  slashCommand = true;

  tagBlacklistService = ServiceRegistry.get(TagBlacklistService);

  async run() {
    const tag = this.parsedArguments.tag;

    await this.tagBlacklistService.saveBannedTagsInContext(this.ctx);

    this.tagBlacklistService.throwIfTagNotAllowedAsInput(this.ctx, tag);

    const { requestable, perspective } = await this.getMentions({
      perspectiveAsCode: false,
    });

    const paginator = new Paginator(
      this.lastFMService.topAlbums.bind(this.lastFMService),
      2,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const [tagTopAlbums, userTopAlbums] = await Promise.all([
      this.lastFMService.tagTopAlbums(this.ctx, { tag, limit: 1000 }),
      paginator.getAllToConcatonable({ concurrent: false }),
    ]);

    const tagAlbumNames = tagTopAlbums!.albums.map((a) =>
      this.generateAlbumName(a.artist.name, a.name)
    );

    const overlap = this.calculateOverlap(userTopAlbums, tagAlbumNames);

    const description =
      `
    _Comparing ${perspective.possessive} top ${displayNumber(
        userTopAlbums.albums.length,
        "album"
      )} and the top ${displayNumber(
        tagAlbumNames.length,
        "album"
      )} of the tag_\n` +
      (overlap.length
        ? `${displayNumber(overlap.length, "album")} (${calculatePercent(
            overlap.length,
            tagAlbumNames.length
          )}% match) (${displayNumber(
            overlap.reduce((sum, o) => sum + o.plays, 0),
            "scrobble"
          )})\n\n`
        : "Couldn't find any matching albums!");

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Tag albums"))
      .setTitle(
        `${perspective.upper.possessive} top ${tagTopAlbums.meta.tag} albums`
      );

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: overlap,
      pageSize: 15,
      pageRenderer(overlap, { offset }) {
        return (
          description +
          displayNumberedList(
            overlap.map(
              (o) =>
                `${bold(o.album)} by ${italic(o.artist)} - ${displayNumber(
                  o.plays,
                  "play"
                )}`
            ),
            offset
          )
        );
      },
      overrides: { itemName: "track" },
    });

    scrollingEmbed.send();
  }

  private calculateOverlap(
    userTopAlbums: TopAlbums,
    tagAlbumNames: string[]
  ): Overlap[] {
    return userTopAlbums.albums.reduce((acc, a) => {
      if (tagAlbumNames.includes(this.generateAlbumName(a.artist.name, a.name)))
        acc.push({
          album: a.name,
          artist: a.artist.name,
          plays: a.userPlaycount,
        });

      return acc;
    }, [] as Overlap[]);
  }

  private generateAlbumName(artist: string, name: string) {
    return `${artist} | ${name}`;
  }
}
