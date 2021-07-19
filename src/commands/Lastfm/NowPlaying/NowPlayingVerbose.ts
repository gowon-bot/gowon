import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";
import { promiseAllSettled } from "../../../helpers";

export default class NowPlayingVerbose extends NowPlayingBaseCommand {
  idSeed = "fx luna";

  aliases = ["npv", "fmv", "fmt"];
  description =
    "Displays the now playing or last played track from Last.fm, including some track information";

  crownsService = new CrownsService(this.logger);

  async run() {
    let { username, discordUser, requestable } =
      await this.nowPlayingMentions();

    let nowPlaying = await this.lastFMService.nowPlaying(requestable);

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    this.tagConsolidator.blacklistTags(nowPlaying.artist, nowPlaying.name);

    let [artistInfo, trackInfo, crown] = await promiseAllSettled([
      this.lastFMService.artistInfo({
        artist: nowPlaying.artist,
        username: requestable,
      }),
      this.lastFMService.trackInfo({
        artist: nowPlaying.artist,
        track: nowPlaying.name,
        username: requestable,
      }),
      this.crownsService.getCrownDisplay(nowPlaying.artist, this.guild),
    ]);

    let { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    if (trackInfo.value)
      this.tagConsolidator.addTags(trackInfo.value?.tags || []);
    if (artistInfo.value)
      this.tagConsolidator.addTags(artistInfo.value?.tags || []);

    let artistPlays = this.artistPlays(artistInfo, nowPlaying, isCrownHolder);
    let noArtistData = this.noArtistData(nowPlaying);
    let trackPlays = this.trackPlays(trackInfo);
    let tags = this.tagConsolidator
      .consolidateAsStrings(Infinity, false)
      .join(" ‧ ");

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

    await this.customReactions(sentMessage);
    await this.easterEggs(sentMessage, nowPlaying);
  }
}
