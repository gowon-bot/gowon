import { promiseAllSettled } from "../../../helpers";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { CrownsService } from "../../../services/dbservices/crowns/CrownsService";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingAlbum extends NowPlayingBaseCommand {
  idSeed = "fx amber";

  aliases = ["fml", "npl", "fma"];
  description =
    "Displays the now playing or last played track from Last.fm, including some album information";

  crownsService = ServiceRegistry.get(CrownsService);

  async run() {
    const { username, requestable, discordUser } = await this.getMentions();

    const nowPlaying = await this.lastFMService.nowPlaying(
      this.ctx,
      requestable
    );

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    this.tagConsolidator.blacklistTags(nowPlaying.artist, nowPlaying.name);

    const [artistInfo, albumInfo, crown] = await promiseAllSettled([
      this.lastFMService.artistInfo(this.ctx, {
        artist: nowPlaying.artist,
        username: requestable,
      }),
      this.lastFMService.albumInfo(this.ctx, {
        artist: nowPlaying.artist,
        album: nowPlaying.album,
        username: requestable,
      }),
      this.crownsService.getCrownDisplay(this.ctx, nowPlaying.artist),
    ]);

    const { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    await this.tagConsolidator.saveServerBannedTagsInContext(this.ctx);

    if (albumInfo.value)
      this.tagConsolidator.addTags(this.ctx, albumInfo.value?.tags || []);
    if (artistInfo.value)
      this.tagConsolidator.addTags(this.ctx, artistInfo.value?.tags || []);

    const artistPlays = this.artistPlays(artistInfo, nowPlaying, isCrownHolder);
    const noArtistData = this.noArtistData(nowPlaying);
    const albumPlays = this.albumPlays(albumInfo);
    const tags = this.tagConsolidator
      .consolidateAsStrings(Infinity)
      .join(" ‧ ");

    const lineConsolidator = new LineConsolidator();
    lineConsolidator.addLines(
      // Top line
      {
        shouldDisplay: !!artistPlays && !!albumPlays && !!crownString,
        string: `${artistPlays} • ${albumPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !!artistPlays && !!albumPlays && !crownString,
        string: `${artistPlays} • ${albumPlays}`,
      },
      {
        shouldDisplay: !!artistPlays && !albumPlays && !!crownString,
        string: `${artistPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !!albumPlays && !!crownString,
        string: `${noArtistData} • ${albumPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !albumPlays && !!crownString,
        string: `${noArtistData} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !!albumPlays && !crownString,
        string: `${noArtistData} • ${albumPlays}`,
      },
      {
        shouldDisplay: !!artistPlays && !albumPlays && !crownString,
        string: `${artistPlays}`,
      },
      {
        shouldDisplay: !artistPlays && !albumPlays && !crownString,
        string: `${noArtistData}`,
      },
      // Second line
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: tags,
      }
    );

    const nowPlayingEmbed = (
      await this.nowPlayingEmbed(nowPlaying, username)
    ).setFooter({
      text: lineConsolidator.consolidate(),
    });

    const sentMessage = await this.send(nowPlayingEmbed);

    await this.customReactions(sentMessage);
    await this.easterEggs(sentMessage, nowPlaying);
  }
}
