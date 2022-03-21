import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";
import { promiseAllSettled } from "../../../helpers";
import { ComboCalculator } from "../../../lib/calculators/ComboCalculator";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { displayNumber } from "../../../lib/views/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

export default class NowPlayingCombo extends NowPlayingBaseCommand {
  idSeed = "iz*one wonyoung";

  aliases = ["fmcombo", "npcombo"];
  description =
    "Displays the now playing or last played track from Last.fm, plus any combos";

  crownsService = ServiceRegistry.get(CrownsService);
  redirectsService = ServiceRegistry.get(RedirectsService);

  async run() {
    let { username, requestable, discordUser } =
      await this.nowPlayingMentions();

    let recentTracks = await this.lastFMService.recentTracks(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    const comboCalculator = new ComboCalculator(this.ctx, []);

    const combo = await comboCalculator.calculate(recentTracks);

    let nowPlaying = recentTracks.first();

    this.tagConsolidator.blacklistTags(nowPlaying.artist, nowPlaying.name);

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    let [artistInfo, crown] = await promiseAllSettled([
      this.lastFMService.artistInfo(this.ctx, {
        artist: nowPlaying.artist,
        username: requestable,
      }),
      this.crownsService.getCrownDisplay(this.ctx, nowPlaying.artist),
    ]);

    await this.tagConsolidator.saveServerBannedTagsInContext(this.ctx);

    if (artistInfo.value) {
      this.tagConsolidator.addTags(this.ctx, artistInfo.value.tags);
    }

    let { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    const artistPlays = this.artistPlays(artistInfo, nowPlaying, isCrownHolder);
    const noArtistData = this.noArtistData(nowPlaying);

    const comboString = `${displayNumber(combo.artist.plays)} in a row ${
      combo.artist.plays > 100 ? "🔥" : ""
    }`;
    const hasCombo = combo.artist.plays > 1;

    let lineConsolidator = new LineConsolidator();
    lineConsolidator.addLines(
      // Top line
      {
        shouldDisplay: !!artistPlays && !!crownString && hasCombo,
        string: `${artistPlays} • ${comboString} • ${crownString}`,
      },
      {
        shouldDisplay: !!artistPlays && !!crownString && !hasCombo,
        string: `${artistPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !!artistPlays && !crownString && hasCombo,
        string: `${artistPlays} • ${comboString}`,
      },
      {
        shouldDisplay: !!artistPlays && !crownString && !hasCombo,
        string: `${artistPlays}`,
      },
      {
        shouldDisplay: !artistPlays && !!crownString && hasCombo,
        string: `${noArtistData} • ${crownString} • ${hasCombo}`,
      },
      {
        shouldDisplay: !artistPlays && !!crownString && !hasCombo,
        string: `${noArtistData} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !crownString && hasCombo,
        string: `${noArtistData} • ${comboString}`,
      },
      {
        shouldDisplay: !artistPlays && !crownString && !hasCombo,
        string: `${noArtistData}`,
      },
      // Second line
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: this.tagConsolidator.consolidateAsStrings(Infinity).join(" ‧ "),
      }
    );

    let nowPlayingEmbed = this.nowPlayingEmbed(nowPlaying, username).setFooter({
      text: lineConsolidator.consolidate(),
    });

    let sentMessage = await this.send(nowPlayingEmbed);

    await this.customReactions(sentMessage);
    await this.easterEggs(sentMessage, nowPlaying);
  }
}
