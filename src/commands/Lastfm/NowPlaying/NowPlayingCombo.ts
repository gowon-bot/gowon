import { parseLastFMTrackResponse } from "../../../helpers/lastFM";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";
import { numberDisplay, promiseAllSettled } from "../../../helpers";
import { ComboCalculator } from "../../../lib/calculators/ComboCalculator";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";

export default class NowPlayingCombo extends NowPlayingBaseCommand {
  idSeed = "iz*one wonyoung";

  aliases = ["fmcombo", "npcombo"];
  description =
    "Displays the now playing or last played track from Last.fm, plus any combos";

  crownsService = new CrownsService(this.logger);
  redirectsService = new RedirectsService(this.logger);

  async run() {
    let { username, discordUser } = await this.nowPlayingMentions();

    let recentTracks = await this.lastFMService.recentTracks({
      username,
      limit: 1000,
    });

    const comboCalculator = new ComboCalculator(this.redirectsService, []);

    const combo = await comboCalculator.calculate(recentTracks);

    let nowPlaying = recentTracks.track[0];

    let track = parseLastFMTrackResponse(nowPlaying);

    this.tagConsolidator.addArtistName(track.artist);

    if (nowPlaying["@attr"]?.nowplaying) this.scrobble(track);

    let [artistInfo, crown] = await promiseAllSettled([
      this.lastFMService.artistInfo({ artist: track.artist, username }),
      this.crownsService.getCrownDisplay(track.artist, this.guild),
    ]);

    if (artistInfo.value) {
      this.tagConsolidator.addTags(artistInfo.value.tags.tag);
    }

    let { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    const artistPlays = this.artistPlays(artistInfo, track, isCrownHolder);
    const noArtistData = this.noArtistData(nowPlaying);

    const comboString = `${numberDisplay(combo.artist.plays)} in a row ${
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
        string: this.tagConsolidator.consolidate(Infinity).join(" ‧ "),
      }
    );

    let nowPlayingEmbed = this.nowPlayingEmbed(nowPlaying, username).setFooter(
      lineConsolidator.consolidate()
    );

    let sentMessage = await this.send(nowPlayingEmbed);

    await this.easterEggs(sentMessage, track);
  }
}
