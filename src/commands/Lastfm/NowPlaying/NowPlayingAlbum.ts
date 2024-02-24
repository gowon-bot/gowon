import { DatasourceServiceContext } from "../../../lib/nowplaying/DatasourceService";
import { LastFMAlbumPlaysComponent } from "../../../lib/nowplaying/components/AlbumPlaysComponent";
import { NowPlayingEmbed } from "../../../lib/ui/embeds/NowPlayingEmbed";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { CrownsService } from "../../../services/dbservices/crowns/CrownsService";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingAlbum extends NowPlayingBaseCommand {
  idSeed = "fx amber";

  aliases = ["fml", "npl", "fma"];
  description =
    "Displays the now playing or last played track from Last.fm, including some album information";

  crownsService = ServiceRegistry.get(CrownsService);

  getConfig(): string[] {
    return ["artist-plays", "artist-tags", "artist-crown"];
  }

  async run() {
    const { username, requestable, dbUser } = await this.getMentions();

    const recentTracks = await this.lastFMService.recentTracks(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    const nowPlaying = recentTracks.first();

    const albumInfo = await this.lastFMService.albumInfo(this.ctx, {
      artist: nowPlaying.artist,
      album: nowPlaying.album,
      username: requestable,
    });

    this.tagConsolidator.blacklistTags(nowPlaying.artist, nowPlaying.name);

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    this.tagConsolidator.blacklistTags(nowPlaying.artist, nowPlaying.name);

    const usernameDisplay = await this.nowPlayingService.getUsernameDisplay(
      this.ctx,
      dbUser,
      username
    );

    const renderedComponents = await this.nowPlayingService.renderComponents(
      this.ctx,
      this.getConfig(),
      recentTracks,
      requestable,
      dbUser,
      { components: [LastFMAlbumPlaysComponent], dependencies: { albumInfo } }
    );

    const tagConsolidator =
      this.ctx.getMutable<DatasourceServiceContext["mutable"]>()
        .tagConsolidator;

    const albumCover = await this.getAlbumCover(recentTracks.first());

    const embed = this.minimalEmbed()
      .transform(NowPlayingEmbed)
      .setDbUser(dbUser)
      .setNowPlaying(recentTracks.first(), tagConsolidator)
      .setAlbumCover(albumCover)
      .setUsername(username)
      .setUsernameDisplay(usernameDisplay)
      .setComponents(renderedComponents)
      .setCustomReacts(await this.getCustomReactions());

    await this.reply(embed);
  }
}
