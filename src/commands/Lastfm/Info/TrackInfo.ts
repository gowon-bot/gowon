import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { LinkConsolidator, toInt } from "../../../helpers/lastFM";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class TrackInfo extends InfoCommand<typeof args> {
  idSeed = "iz*one eunbi";

  shouldBeIndexed = true;

  aliases = ["tri", "ti"];
  description = "Displays some information about a track";
  usage = ["", "artist | track"];

  arguments: Arguments = args;

  lineConsolidator = new LineConsolidator();

  async run() {
    const { senderRequestable } = await this.getMentions({
      senderRequired:
        !this.parsedArguments.artist || !this.parsedArguments.track,
    });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable
    );

    const [trackInfo, spotifyTrack] = await Promise.all([
      this.lastFMService.trackInfo(this.ctx, { artist, track }),
      this.spotifyService.searchTrack(this.ctx, artist, track),
    ]);

    console.log(spotifyTrack);

    this.tagConsolidator.blacklistTags(trackInfo.artist.name, trackInfo.name);
    this.tagConsolidator.addTags(trackInfo.tags);

    const linkConsolidator = new LinkConsolidator([
      LinkConsolidator.spotify(spotifyTrack?.external_urls?.spotify),
      LinkConsolidator.lastfm(trackInfo.url),
    ]);

    const duration = toInt(trackInfo.duration);

    this.lineConsolidator.addLines(
      (duration
        ? `_${displayNumber(Math.round(duration / 60000), "minute")}_`
        : "") +
        (duration && trackInfo.album ? " - " : "") +
        (trackInfo.album
          ? `from the album ${trackInfo.album?.name.italic()}`
          : ""),
      {
        shouldDisplay: !!(duration || trackInfo.album),
        string: "",
      },
      {
        shouldDisplay: !!trackInfo.wiki,
        string:
          this.scrubReadMore(trackInfo.wiki?.summary?.trimRight())! + "\n",
      },
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: `**Tags:** ${this.tagConsolidator
          .consolidateAsStrings(Infinity, false)
          .join(" ‧ ")}`,
      },
      {
        shouldDisplay: linkConsolidator.hasLinks(),
        string: `**Links:** ${linkConsolidator.consolidate()}`,
      }
    );

    const embed = this.newEmbed()
      .setTitle(
        trackInfo.name.italic() + " by " + trackInfo.artist.name.strong()
      )
      .setDescription(this.lineConsolidator.consolidate())
      .setThumbnail(trackInfo.album?.images?.get("large") || "")
      .addFields(
        {
          name: "Listeners",
          value: displayNumber(trackInfo.listeners),
          inline: true,
        },
        {
          name: "Playcount",
          value: displayNumber(trackInfo.globalPlaycount),
          inline: true,
        }
      )
      .setURL(trackInfo.url);

    this.send(embed);
  }
}
