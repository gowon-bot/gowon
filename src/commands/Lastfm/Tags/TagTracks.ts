import { TagNotAllowedError } from "../../../errors/errors";
import { calculatePercent } from "../../../helpers/stats";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { Paginator } from "../../../lib/paginators/Paginator";
import { displayNumber } from "../../../lib/views/displays";
import { TopTracks } from "../../../services/LastFM/converters/TopTypes";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { WordBlacklistService } from "../../../services/WordBlacklistService";
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
    description: "The tag to filter your track with",
  }),
  ...standardMentions,
} as const;

export default class TagTracks extends LastFMBaseCommand<typeof args> {
  idSeed = "iz*one nako";

  description =
    "Shows the overlap between your top tracks, and a given tag's top tracks.";
  extraDescription =
    " This command works best for smaller/memey tags, as a lot of larger tags are mistagged";
  subcategory = "tags";
  aliases = ["tagt", "tagtr", "tagtrack"];
  usage = ["tag"];

  arguments = args;

  slashCommand = true;

  wordBlacklistService = ServiceRegistry.get(WordBlacklistService);

  async run() {
    const tag = this.parsedArguments.tag;

    await this.wordBlacklistService.saveServerBannedTagsInContext(this.ctx);

    if (
      this.settingsService.get("strictTagBans", { guildID: this.guild.id }) &&
      !this.wordBlacklistService.isAllowed(this.ctx, tag, ["tags"])
    ) {
      throw new TagNotAllowedError();
    }

    const { requestable, perspective } = await this.getMentions({
      asCode: false,
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

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor)
      .setTitle(
        `${perspective.upper.possessive} top ${tagTopTracks.meta.tag} tracks`
      )
      .setDescription(
        `
_Comparing ${perspective.possessive} top ${displayNumber(
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
              )})\n\n` +
              `${overlap
                .slice(0, 20)
                .map(
                  (o, idx) =>
                    `${
                      idx + 1
                    }. ${o.track.strong()} by ${o.artist.italic()} - ${displayNumber(
                      o.plays,
                      "play"
                    )}`
                )
                .join("\n")}
`
            : "Couldn't find any matching tracks!")
      );

    await this.send(embed);
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
