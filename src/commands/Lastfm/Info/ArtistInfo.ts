import { bold } from "../../../helpers/discord";
import { LinkConsolidator } from "../../../helpers/lastfm/";
import { calculatePercent } from "../../../helpers/stats";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { displayNumber } from "../../../lib/views/displays";
import { CrownsService } from "../../../services/dbservices/crowns/CrownsService";
import { LilacTagsService } from "../../../services/lilac/LilacTagsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { InfoCommand } from "./InfoCommand";

const args = {
  ...prefabArguments.artist,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class ArtistInfo extends InfoCommand<typeof args> {
  idSeed = "csvc lovey";
  shouldBeIndexed = true;

  aliases = ["ai", "as"];
  description = "Displays some information about an artist";
  usage = ["", "artist"];

  slashCommand = true;

  arguments = args;

  crownsService = ServiceRegistry.get(CrownsService);
  lilacTagsService = ServiceRegistry.get(LilacTagsService);
  lineConsolidator = new LineConsolidator();

  async run() {
    let { senderRequestable, requestable, perspective } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
      });

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const [artistInfo, userInfo, spotifyArtistSearch] = await Promise.all([
      this.lastFMService.artistInfo(this.ctx, {
        artist,
        username: requestable,
      }),
      this.lastFMService.userInfo(this.ctx, { username: requestable }),
      this.spotifyService.searchArtist(this.ctx, artist),
    ]);

    const crown = await this.crownsService.getCrownDisplay(
      this.ctx,
      artistInfo.name
    );

    const tags = await this.lilacTagsService.getTagsForArtists(this.ctx, [
      { name: artist },
    ]);

    await this.tagConsolidator.saveServerBannedTagsInContext(this.ctx);
    this.tagConsolidator.addTags(this.ctx, artistInfo.tags);
    this.tagConsolidator.addTags(this.ctx, tags);

    const linkConsolidator = new LinkConsolidator([
      LinkConsolidator.spotify(
        spotifyArtistSearch.hasAnyResults
          ? spotifyArtistSearch.bestResult.externalURLs.spotify
          : undefined
      ),
      LinkConsolidator.lastfm(artistInfo.url),
    ]);

    this.lineConsolidator.addLines(
      {
        shouldDisplay: !!artistInfo.wiki.summary,
        string: this.scrubReadMore(artistInfo.wiki.summary.trimRight())!,
      },
      {
        shouldDisplay: !!artistInfo.wiki.summary.trim(),
        string: "",
      },
      {
        shouldDisplay: !!artistInfo.similarArtists.length,
        string: `**Similar artists:** ${artistInfo.similarArtists
          .map((t) => t.name)
          .join(" ‧ ")}`,
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
      },
      `**Listeners**: ${displayNumber(artistInfo.listeners)}`,
      `**Playcount**: ${displayNumber(artistInfo.globalPlaycount)}`,
      {
        shouldDisplay: crown?.user?.username !== undefined,
        string: `**Crown**: ${crown?.user?.username} (${displayNumber(
          crown?.crown.plays!
        )})`,
      }
    );

    const percentage = calculatePercent(
      artistInfo.userPlaycount,
      artistInfo.globalPlaycount,
      4
    );

    const embed = this.newEmbed()
      .setTitle(artistInfo.name)
      .setURL(artistInfo.url)
      .setDescription(this.lineConsolidator.consolidate())
      .addFields([
        {
          name: `${perspective.upper.possessive} stats`,
          value: `\`${displayNumber(
            artistInfo.userPlaycount,
            "` play",
            true
          )} by ${perspective.objectPronoun} (${bold(
            calculatePercent(artistInfo.userPlaycount, userInfo.scrobbleCount)
          )}% of ${perspective.possessivePronoun} total scrobbles)
${
  parseFloat(percentage) > 0
    ? `${perspective.upper.regularVerb("account")} for ${bold(
        percentage
      )}% of all ${artistInfo.name} scrobbles!`
    : ""
}\n`,
        },
      ]);

    if (spotifyArtistSearch.hasAnyResults) {
      embed.setThumbnail(spotifyArtistSearch.bestResult.images.largest.url);
      embed.setFooter({ text: "Image source: Spotify" });
    }

    this.send(embed);
  }
}
