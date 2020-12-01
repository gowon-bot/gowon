import { parseLastFMTrackResponse } from "../../../helpers/lastFM";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlaying extends NowPlayingBaseCommand {
  aliases = ["np", "fm"];
  description = "Displays the now playing or last played track from Last.fm";

  crownsService = new CrownsService(this.logger);

  async run() {
    let { username, discordUser } = await this.nowPlayingMentions();

    let nowPlayingResponse = await this.lastFMService.recentTracks({
      username,
      limit: 1,
    });

    let nowPlaying = nowPlayingResponse.track[0];

    let track = parseLastFMTrackResponse(nowPlaying);

    if (nowPlaying["@attr"]?.nowplaying) this.scrobble(track);

    this.tagConsolidator.addArtistName(track.artist);

    let nowPlayingEmbed = this.nowPlayingEmbed(nowPlaying, username);

    // Types for Promise.allSettled are broken(?), so I have to manually assert the type that's returned
    let [artistInfo, crown] = (await Promise.allSettled([
      this.lastFMService.artistInfo({ artist: track.artist, username }),
      this.crownsService.getCrownDisplay(track.artist, this.guild),
    ])) as { status: string; value?: any; reason: any }[];

    let { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    this.tagConsolidator.addTags(artistInfo.value?.tags?.tag || []);

    let lineConsolidator = new LineConsolidator();

    let artistPlays = this.artistPlays(artistInfo, track, isCrownHolder);
    let noArtistData = this.noArtistData(nowPlaying);
    let scrobbleCount = this.scrobbleCount(nowPlayingResponse);

    lineConsolidator.addLines(
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: this.tagConsolidator.tags.join(" ‧ "),
      },
      {
        shouldDisplay: !!artistInfo.value && !!crownString,
        string: `${artistPlays} • ${scrobbleCount} • ${crownString}`,
      },
      {
        shouldDisplay: !!artistInfo.value && !crownString,
        string: `${artistPlays} • ${scrobbleCount}`,
      },
      {
        shouldDisplay: !artistInfo.value && !!crownString,
        string: `${noArtistData} • ${scrobbleCount} • ${crownString}`,
      },
      {
        shouldDisplay: !artistInfo.value && !crownString,
        string: `${noArtistData} • ${scrobbleCount}`,
      }
    );

    nowPlayingEmbed.setFooter(lineConsolidator.consolidate());

    let sentMessage = await this.send(nowPlayingEmbed);

    await this.easterEggs(sentMessage, track);
  }
}
