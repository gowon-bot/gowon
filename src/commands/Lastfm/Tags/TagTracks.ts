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
import { TopTracks } from "../../../services/LastFM/converters/TopTypes";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { TagBlacklistService } from "../../../services/moderation/TagBlacklistService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

interface Overlap {
  track: string;
  artist: string;
  plays: number;
}

const args = {
  tag: new StringArgument({
    index: { start: 0 },
    required: true,
    description: "The tag to filter your tracks with",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class TagTracks extends LastFMBaseCommand<typeof args> {
  idSeed = "iz*one nako";

  description =
    "Shows the overlap between your top tracks, and a given tag's top tracks.";
  extraDescription =
    " This command works best for smaller/joke tags, as a lot of larger tags are mistagged";
  subcategory = "tags";
  aliases = ["tagt", "tagtr", "tagtrack"];
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
      this.lastFMService.topTracks.bind(this.lastFMService),
      3,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const [tagTopTracks, userTopTracks] = await Promise.all([
      this.lastFMService.tagTopTracks(this.ctx, { tag, limit: 1000 }),
      paginator.getAllToConcatonable({ concurrent: false }),
    ]);

    const tagTrackNames = tagTopTracks!.tracks.map((t) =>
      this.generateTrackName(t.artist.name, t.name)
    );

    const overlap = this.calculateOverlap(userTopTracks, tagTrackNames);

    const description =
      `_Comparing ${perspective.possessive} top ${displayNumber(
        userTopTracks.tracks.length,
        "track"
      )} and the top ${displayNumber(
        tagTrackNames.length,
        "track"
      )} of the tag_\n` +
      (overlap.length
        ? `${displayNumber(overlap.length, "track")} (${calculatePercent(
            overlap.length,
            tagTrackNames.length
          )}% match) (${displayNumber(
            overlap.reduce((sum, o) => sum + o.plays, 0),
            "scrobble"
          )})\n\n`
        : "Couldn't find any matching tracks!");

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Tag tracks"))
      .setTitle(
        `${perspective.upper.possessive} top ${tagTopTracks.meta.tag} tracks`
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
                `${bold(o.track)} by ${italic(o.artist)} - ${displayNumber(
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
    userTopTracks: TopTracks,
    tagTrackNames: string[]
  ): Overlap[] {
    return userTopTracks.tracks.reduce((acc, t) => {
      if (tagTrackNames.includes(this.generateTrackName(t.artist.name, t.name)))
        acc.push({
          track: t.name,
          artist: t.artist.name,
          plays: t.userPlaycount,
        });

      return acc;
    }, [] as Overlap[]);
  }

  private generateTrackName(artist: string, name: string) {
    return `${artist} | ${name}`;
  }
}
