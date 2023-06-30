import { bold, italic } from "../../../helpers/discord";
import { LinkConsolidator } from "../../../helpers/lastfm";
import { calculatePercent } from "../../../helpers/stats";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { displayNumber } from "../../../lib/views/displays";
import { InfoCommand } from "./InfoCommand";

const args = {
  ...prefabArguments.album,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class AlbumInfo extends InfoCommand<typeof args> {
  idSeed = "nature uchae";

  shouldBeIndexed = true;

  aliases = ["ali", "li", "als", "ls"];
  description = "Displays some information about an album";
  usage = ["", "artist | album"];

  arguments = args;
  slashCommand = true;

  lineConsolidator = new LineConsolidator();

  async run() {
    const { senderRequestable, requestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
      });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable
    );

    const [albumInfo, userInfo, spotifyAlbumSearch] = await Promise.all([
      this.lastFMService.albumInfo(this.ctx, {
        artist,
        album,
        username: requestable,
      }),
      this.lastFMService.userInfo(this.ctx, { username: requestable }),
      this.spotifyService.searchAlbum(this.ctx, { artist, album }),
    ]);

    await this.tagConsolidator.saveServerBannedTagsInContext(this.ctx);
    this.tagConsolidator.blacklistTags(albumInfo.artist, albumInfo.name);
    this.tagConsolidator.addTags(this.ctx, albumInfo.tags);

    const linkConsolidator = new LinkConsolidator([
      LinkConsolidator.spotify(
        spotifyAlbumSearch.hasAnyResults
          ? spotifyAlbumSearch.bestResult.externalURLs.spotify
          : undefined
      ),
      LinkConsolidator.lastfm(albumInfo.url),
    ]);

    const albumDuration = albumInfo.tracks.reduce(
      (sum, t) => sum + t.duration,
      0
    );

    const spotifyAlbumArt =
      spotifyAlbumSearch.hasAnyResults &&
      spotifyAlbumSearch.bestResult.isExactMatch
        ? spotifyAlbumSearch.bestResult.images.largest
        : undefined;

    this.lineConsolidator.addLines(
      {
        shouldDisplay: albumInfo.tracks.length > 0 && !!albumDuration,
        string: `_${displayNumber(
          albumInfo.tracks.length,
          "track"
        )} (${displayNumber(Math.ceil(albumDuration / 60), "minute")})_`,
      },
      {
        shouldDisplay: albumInfo.tracks.length > 0 && !albumDuration,
        string: `_${displayNumber(albumInfo.tracks.length, "track")}_`,
      },
      {
        shouldDisplay: albumInfo.tracks.length > 0,
        string: "",
      },
      {
        shouldDisplay: !!albumInfo.wiki?.summary?.trim(),
        string: this.scrubReadMore(albumInfo.wiki?.summary.trimRight())!,
      },
      {
        shouldDisplay: !!albumInfo.wiki?.summary?.trim(),
        string: "",
      },
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: `**Tags:** ${this.tagConsolidator
          .consolidateAsStrings()
          .join(" ‧ ")}`,
      },
      {
        shouldDisplay: linkConsolidator.hasLinks(),
        string: `**Links**: ${linkConsolidator.consolidate()}`,
      }
    );

    const percentage = calculatePercent(
      albumInfo.userPlaycount,
      albumInfo.globalPlaycount
    );

    const albumCover = await this.albumCoverService.getWithDetails(
      this.ctx,
      albumInfo.images.get("large") || spotifyAlbumArt?.url,
      {
        metadata: { artist, album },
      }
    );

    const embed = this.newEmbed()
      .setTitle(italic(albumInfo.name) + " by " + bold(albumInfo.artist))
      .setDescription(this.lineConsolidator.consolidate())
      .setURL(albumInfo.url)
      .setImage(albumCover.url || "")
      .addFields(
        {
          name: "Listeners",
          value: displayNumber(albumInfo.listeners),
          inline: true,
        },
        {
          name: "Playcount",
          value: displayNumber(albumInfo.globalPlaycount),
          inline: true,
        },
        {
          name: `${perspective.upper.possessive} stats`,
          value: `
        \`${displayNumber(albumInfo.userPlaycount, "` play", true)} by ${
            perspective.objectPronoun
          } (${bold(
            calculatePercent(albumInfo.userPlaycount, userInfo.scrobbleCount, 4)
          )}% of ${perspective.possessivePronoun} total scrobbles)
        ${
          parseFloat(percentage) > 0
            ? `${perspective.upper.regularVerb("account")} for ${bold(
                percentage
              )}% of all scrobbles of this album!`
            : ""
        }`,
        }
      )
      .setFooter({
        text:
          albumCover.source === "custom" || albumCover.source === "moderation"
            ? ""
            : albumInfo.images.get("large")
            ? "Image source: Last.fm"
            : spotifyAlbumArt && spotifyAlbumArt.url
            ? "Image source: Spotify"
            : "",
      });

    this.send(embed);
  }
}
