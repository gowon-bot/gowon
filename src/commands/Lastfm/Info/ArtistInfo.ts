import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { calculatePercent } from "../../../helpers/stats";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LinkConsolidator } from "../../../helpers/lastFM";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";
import { TagsService } from "../../../services/mirrorball/services/TagsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class ArtistInfo extends InfoCommand<typeof args> {
  idSeed = "csvc lovey";
  shouldBeIndexed = true;

  aliases = ["ai", "as"];
  description = "Displays some information about an artist";
  usage = ["", "artist"];

  arguments: Arguments = args;

  tagsService = ServiceRegistry.get(TagsService);
  crownsService = ServiceRegistry.get(CrownsService);
  lineConsolidator = new LineConsolidator();

  async run() {
    let { senderRequestable, requestable, perspective } =
      await this.parseMentions({
        senderRequired: !this.parsedArguments.artist,
      });

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const [artistInfo, userInfo, spotifyArtist] = await Promise.all([
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

    const tags = await this.tagsService.getTagsForArtists(this.ctx, [
      { name: artist },
    ]);

    await this.tagConsolidator.saveServerBannedTagsInContext(this.ctx);
    this.tagConsolidator.addTags(this.ctx, artistInfo.tags);
    this.tagConsolidator.addTags(this.ctx, tags);

    const linkConsolidator = new LinkConsolidator([
      LinkConsolidator.spotify(spotifyArtist?.external_urls?.spotify),
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
      .addField(
        `${perspective.upper.possessive} stats`,
        `\`${displayNumber(artistInfo.userPlaycount, "` play", true)} by ${
          perspective.objectPronoun
        } (${calculatePercent(
          artistInfo.userPlaycount,
          userInfo.scrobbleCount
        ).strong()}% of ${perspective.possessivePronoun} total scrobbles)
${
  parseFloat(percentage) > 0
    ? `${perspective.upper.regularVerb(
        "account"
      )} for ${percentage.strong()}% of all ${artistInfo.name} scrobbles!`
    : ""
}
        `
      );

    if (spotifyArtist) {
      embed.setThumbnail(
        this.spotifyService.getImageFromSearchItem(spotifyArtist)
      );
      embed.setFooter("Image source: Spotify");
    }

    this.send(embed);
  }
}
