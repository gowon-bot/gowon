import { promiseAllSettled } from "../../../helpers";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { CrownsService } from "../../../services/dbservices/crowns/CrownsService";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingVerbose extends NowPlayingBaseCommand {
  idSeed = "fx luna";

  aliases = ["npv", "fmv", "fmt"];
  description =
    "Displays the now playing or last played track from Last.fm, including some track information";

  crownsService = ServiceRegistry.get(CrownsService);

  async run() {
    const { username, discordUser, requestable, dbUser } =
      await this.getMentions();

    const nowPlaying = await this.lastFMService.nowPlaying(
      this.ctx,
      requestable
    );

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    this.tagConsolidator.blacklistTags(nowPlaying.artist, nowPlaying.name);

    const [artistInfo, trackInfo, crown] = await promiseAllSettled([
      this.lastFMService.artistInfo(this.ctx, {
        artist: nowPlaying.artist,
        username: requestable,
      }),
      this.lastFMService.trackInfo(this.ctx, {
        artist: nowPlaying.artist,
        track: nowPlaying.name,
        username: requestable,
      }),
      this.crownsService.getCrownDisplay(this.ctx, nowPlaying.artist),
    ]);

    const { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    await this.tagConsolidator.saveBannedTagsInContext(this.ctx);

    if (trackInfo.value) {
      this.tagConsolidator.addTags(this.ctx, trackInfo.value?.tags || []);
    }
    if (artistInfo.value) {
      this.tagConsolidator.addTags(this.ctx, artistInfo.value?.tags || []);
    }

    const artistPlays = this.artistPlays(artistInfo, nowPlaying, isCrownHolder);
    const noArtistData = this.noArtistData(nowPlaying);
    const trackPlays = this.trackPlays(trackInfo);
    const tags = this.tagConsolidator
      .consolidateAsStrings(Infinity, false)
      .join(" ‧ ");

    const lineConsolidator = new LineConsolidator();
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

    const nowPlayingEmbed = (
      await this.nowPlayingEmbed(this.ctx, nowPlaying, username, dbUser)
    ).setFooter({
      text: lineConsolidator.consolidate(),
    });

    const sentMessage = await this.send(nowPlayingEmbed);

    await this.customReactions(sentMessage);
    await this.easterEggs(sentMessage, nowPlaying);
  }
}
