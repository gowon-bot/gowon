import { TagNotAllowedError } from "../../../errors/errors";
import { bold, italic } from "../../../helpers/discord";
import { calculatePercent } from "../../../helpers/stats";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { Paginator } from "../../../lib/paginators/Paginator";
import { displayNumber } from "../../../lib/views/displays";
import { TopAlbums } from "../../../services/LastFM/converters/TopTypes";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { WordBlacklistService } from "../../../services/WordBlacklistService";
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
} as const;

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

  wordBlacklistService = ServiceRegistry.get(WordBlacklistService);

  async run() {
    const tag = this.parsedArguments.tag;

    await this.wordBlacklistService.saveServerBannedTagsInContext(this.ctx);

    if (
      this.settingsService.get("strictTagBans", {
        guildID: this.requiredGuild.id,
      }) &&
      !this.wordBlacklistService.isAllowed(this.ctx, tag, ["tags"])
    ) {
      throw new TagNotAllowedError();
    }

    const { requestable, perspective } = await this.getMentions({
      asCode: false,
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

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Tag albums"))
      .setTitle(
        `${perspective.upper.possessive} top ${tagTopAlbums.meta.tag} albums`
      )
      .setDescription(
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
              )})\n\n` +
              `${overlap
                .slice(0, 20)
                .map(
                  (o, idx) =>
                    `${idx + 1}. ${bold(o.album)} by ${italic(
                      o.artist
                    )} - ${displayNumber(o.plays, "play")}`
                )
                .join("\n")}
`
            : "Couldn't find any matching albums!")
      );

    await this.send(embed);
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
