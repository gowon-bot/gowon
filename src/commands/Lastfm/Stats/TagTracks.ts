import { calculatePercent } from "../../../helpers/stats";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { Paginator } from "../../../lib/Paginator";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayNumber } from "../../../lib/views/displays";
import { TopTracks } from "../../../services/LastFM/converters/TopTypes";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

interface Overlap {
  track: string;
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

export default class TagTracks extends LastFMBaseCommand<typeof args> {
  idSeed = "iz*one nako";

  description =
    "Shows the overlap between your top tracks, and a given tag's top tracks. This command works best for smaller/memey tags, as a lot of larger tags are mistagged";
  subcategory = "tags";
  aliases = ["tagt", "tagtr", "tagtrack"];
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
      this.lastFMService.topTracks.bind(this.lastFMService),
      3,
      { username, limit: 1000 }
    );

    let [tagTopTracks, userTopTracks] = await Promise.all([
      this.lastFMService.tagTopTracks({ tag, limit: 1000 }),
      paginator.getAllToConcatonable({ concurrent: false }),
    ]);

    let tagTrackNames = tagTopTracks!.tracks.map((t) =>
      this.generateTrackName(t.artist.name, t.name)
    );

    let overlap = this.calculateOverlap(userTopTracks, tagTrackNames);

    let embed = this.newEmbed()
      .setAuthor(this.author.username, this.author.avatarURL() || "")
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
