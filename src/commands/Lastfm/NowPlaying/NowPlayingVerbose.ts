import { parseLastFMTrackResponse } from "../../../helpers/lastFM";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingVerbose extends NowPlayingBaseCommand {
  aliases = ["npv", "fmv", "fmt"];
  description =
    "Displays the now playing or last played track from Last.fm, including some track information";

  crownsService = new CrownsService(this.logger);

  async run() {
    let { username, discordUser } = await this.nowPlayingMentions();

    let nowPlaying = await this.lastFMService.nowPlaying(username);

    let track = parseLastFMTrackResponse(nowPlaying);

    if (nowPlaying["@attr"]?.nowplaying) this.scrobble(track);

    this.tagConsolidator.addArtistName(track.artist);

    // Types for Promise.allSettled are broken(?), so I have to manually assert the type that's returned
    let [artistInfo, trackInfo, crown] = (await Promise.allSettled([
      this.lastFMService.artistInfo({ artist: track.artist, username }),
      this.lastFMService.trackInfo({
        artist: track.artist,
        track: track.name,
        username,
      }),
      this.crownsService.getCrownDisplay(track.artist, this.guild),
    ])) as { status: string; value?: any; reason: any }[];

    let { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    if (trackInfo.value)
      this.tagConsolidator.addTags(trackInfo.value?.toptags?.tag || []);
    if (artistInfo.value)
      this.tagConsolidator.addTags(artistInfo.value?.tags?.tag || []);

    let artistPlays = this.artistPlays(artistInfo, track, isCrownHolder);
    let noArtistData = this.noArtistData(nowPlaying);
    let trackPlays = this.trackPlays(trackInfo);
    let tags = this.tagConsolidator.consolidate(Infinity).join(" ‧ ");

    let lineConsolidator = new LineConsolidator();
    lineConsolidator.addLines(
      // Top line
      {
        shouldDisplay: !!artistPlays && !!trackPlays && !!crownString,
        string: `${artistPlays} • ${trackPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !!artistPlays && !!trackPlays && !crownString,
        string: `${artistPlays} • ${trackPlays}`,
      },
      {
        shouldDisplay: !!artistPlays && !trackPlays && !!crownString,
        string: `${artistPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !!trackPlays && !!crownString,
        string: `${noArtistData} • ${trackPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !trackPlays && !!crownString,
        string: `${noArtistData} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !!trackPlays && !crownString,
        string: `${noArtistData} • ${trackPlays}`,
      },
      {
        shouldDisplay: !!artistPlays && !trackPlays && !crownString,
        string: `${artistPlays}`,
      },
      {
        shouldDisplay: !artistPlays && !trackPlays && !crownString,
        string: `${noArtistData}`,
      },
      // Second line
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: tags,
      }
    );

    let nowPlayingEmbed = this.nowPlayingEmbed(nowPlaying, username).setFooter(
      lineConsolidator.consolidate()
    );

    let sentMessage = await this.send(nowPlayingEmbed);

    await this.easterEggs(sentMessage, track);
  }
}
