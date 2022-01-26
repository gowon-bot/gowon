import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";
import { promiseAllSettled } from "../../../helpers";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

export default class NowPlayingAlbum extends NowPlayingBaseCommand {
  idSeed = "fx amber";

  aliases = ["fml", "npl", "fma"];
  description =
    "Displays the now playing or last played track from Last.fm, including some album information";

  crownsService = ServiceRegistry.get(CrownsService);

  async run() {
    let { username, requestable, discordUser } =
      await this.nowPlayingMentions();

    let nowPlaying = await this.lastFMService.nowPlaying(this.ctx, requestable);

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    this.tagConsolidator.blacklistTags(nowPlaying.artist, nowPlaying.name);

    let [artistInfo, albumInfo, crown] = await promiseAllSettled([
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

    let { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    await this.tagConsolidator.saveServerBannedTagsInContext(this.ctx);

    if (albumInfo.value)
      this.tagConsolidator.addTags(this.ctx, albumInfo.value?.tags || []);
    if (artistInfo.value)
      this.tagConsolidator.addTags(this.ctx, artistInfo.value?.tags || []);

    let artistPlays = this.artistPlays(artistInfo, nowPlaying, isCrownHolder);
    let noArtistData = this.noArtistData(nowPlaying);
    let albumPlays = this.albumPlays(albumInfo);
    let tags = this.tagConsolidator.consolidateAsStrings(Infinity).join(" ‧ ");

    let lineConsolidator = new LineConsolidator();
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

    let nowPlayingEmbed = this.nowPlayingEmbed(nowPlaying, username).setFooter({
      text: lineConsolidator.consolidate(),
    });

    let sentMessage = await this.send(nowPlayingEmbed);

    await this.customReactions(sentMessage);
    await this.easterEggs(sentMessage, nowPlaying);
  }
}
