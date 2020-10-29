import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LinkConsolidator } from "../../../helpers/lastFM";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class ArtistInfo extends InfoCommand {
  shouldBeIndexed = true;

  aliases = ["ai", "as"];
  description = "Display some information about an artist";
  usage = ["", "artist"];

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
    mentions: standardMentions,
  };

  crownsService = new CrownsService();
  lineConsolidator = new LineConsolidator();

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let { senderUsername, username, perspective } = await this.parseMentions({
      senderRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let [artistInfo, userInfo, spotifyArtist] = await Promise.all([
      this.lastFMService.artistInfo({ artist, username }),
      this.lastFMService.userInfo({ username }),
      this.spotifyService.searchArtist(artist),
    ]);

    let crown = await this.crownsService.getCrownDisplay(
      artistInfo.name,
      message
    );

    this.tagConsolidator.addTags(artistInfo.tags.tag);

    let linkConsolidator = new LinkConsolidator([
      LinkConsolidator.spotify(spotifyArtist?.external_urls?.spotify),
      LinkConsolidator.lastfm(artistInfo.url),
    ]);

    this.lineConsolidator.addLines(
      {
        shouldDisplay: !!artistInfo.bio.summary,
        string: this.scrubReadMore(artistInfo.bio.summary.trimRight())!,
      },
      {
        shouldDisplay: !!artistInfo.bio.summary.trim(),
        string: "",
      },
      {
        shouldDisplay: !!artistInfo.similar.artist.length,
        string: `**Similar artists:** ${artistInfo.similar.artist
          .map((t) => t.name)
          .join(" ‧ ")}`,
      },
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: `**Tags:** ${this.tagConsolidator.consolidate().join(" ‧ ")}`,
      },
      {
        shouldDisplay: linkConsolidator.hasLinks(),
        string: `**Links**: ${linkConsolidator.consolidate()}`,
      },
      `**Listeners**: ${numberDisplay(artistInfo.stats.listeners)}`,
      `**Playcount**: ${numberDisplay(artistInfo.stats.playcount)}`,
      {
        shouldDisplay: crown?.user?.username !== undefined,
        string: `**Crown**: ${crown?.user?.username}`,
      }
    );

    let percentage = calculatePercent(
      artistInfo.stats.userplaycount,
      artistInfo.stats.playcount,
      4
    );

    let embed = this.newEmbed()
      .setTitle(artistInfo.name)
      .setURL(artistInfo.url)
      .setDescription(this.lineConsolidator.consolidate())
      .addField(
        `${perspective.upper.possessive} stats`,
        `\`${numberDisplay(
          artistInfo.stats.userplaycount,
          "` play",
          true
        )} by ${perspective.objectPronoun} (${calculatePercent(
          artistInfo.stats.userplaycount,
          userInfo.playcount
        ).bold()}% of ${perspective.possessivePronoun} total scrobbles)
${
  parseFloat(percentage) > 0
    ? `${perspective.upper.regularVerb(
        "account"
      )} for ${percentage.bold()}% of all ${artistInfo.name} scrobbles!`
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
