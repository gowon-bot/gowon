import { bold, italic } from "../../../helpers/discord";
import { LinkConsolidator, toInt } from "../../../helpers/lastfm/";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { displayNumber } from "../../../lib/ui/displays";
import { InfoCommand } from "./InfoCommand";

const args = {
  ...prefabArguments.track,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class TrackInfo extends InfoCommand<typeof args> {
  idSeed = "iz*one eunbi";

  shouldBeIndexed = true;

  aliases = ["tri", "ti"];
  description = "Displays some information about a track";
  usage = ["", "artist | track"];

  slashCommand = true;

  arguments = args;

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

    const [trackInfo, spotifyTrackSearch] = await Promise.all([
      this.lastFMService.trackInfo(this.ctx, { artist, track }),
      this.spotifyService.searchTrack(this.ctx, { artist, track }),
    ]);

    await this.tagConsolidator.saveServerBannedTagsInContext(this.ctx);

    this.tagConsolidator.blacklistTags(trackInfo.artist.name, trackInfo.name);
    this.tagConsolidator.addTags(this.ctx, trackInfo.tags);

    const linkConsolidator = new LinkConsolidator([
      LinkConsolidator.spotify(
        spotifyTrackSearch.hasAnyResults
          ? spotifyTrackSearch.bestResult.externalURLs.spotify
          : undefined
      ),
      LinkConsolidator.lastfm(trackInfo.url),
    ]);

    const duration = toInt(trackInfo.duration);

    this.lineConsolidator.addLines(
      (duration
        ? `_${displayNumber(Math.round(duration / 60000), "minute")}_`
        : "") +
        (duration && trackInfo.album ? " - " : "") +
        (trackInfo.album
          ? `from the album ${italic(trackInfo.album?.name)}`
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

    const embed = this.authorEmbed()
      .setTitle(italic(trackInfo.name) + " by " + bold(trackInfo.artist.name))
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
