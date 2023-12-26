import { ComboCalculator } from "../../../lib/calculators/ComboCalculator";
import { DatasourceServiceContext } from "../../../lib/nowplaying/DatasourceService";
import { ComboComponent } from "../../../lib/nowplaying/components/hidden/ComboComponent";
import { NowPlayingEmbed } from "../../../lib/ui/embeds/NowPlayingEmbed";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { NowPlayingService } from "../../../services/dbservices/NowPlayingService";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { CrownsService } from "../../../services/dbservices/crowns/CrownsService";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingCombo extends NowPlayingBaseCommand {
  idSeed = "iz*one wonyoung";

  aliases = ["fmcombo", "npcombo"];
  description =
    "Displays the now playing or last played track from Last.fm, plus any combos";

  crownsService = ServiceRegistry.get(CrownsService);
  redirectsService = ServiceRegistry.get(RedirectsService);

  getConfig(): string[] {
    return NowPlayingService.presets.default;
  }

  async run() {
    const { username, requestable, dbUser } = await this.getMentions();

    const recentTracks = await this.lastFMService.recentTracks(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    const comboCalculator = new ComboCalculator(this.ctx, []);

    const combo = await comboCalculator.calculate(recentTracks);

    const nowPlaying = recentTracks.first();

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
      { components: [ComboComponent], dependencies: { combo } }
    );

    const tagConsolidator =
      this.ctx.getMutable<DatasourceServiceContext["mutable"]>()
        .tagConsolidator;

    const albumCover = await this.getAlbumCover(recentTracks.first());

    const embed = this.authorEmbed()
      .transform(NowPlayingEmbed)
      .setDbUser(dbUser)
      .setNowPlaying(recentTracks.first(), tagConsolidator)
      .setAlbumCover(albumCover)
      .setUsername(username)
      .setUsernameDisplay(usernameDisplay)
      .setComponents(renderedComponents)
      .setCustomReacts(await this.getCustomReactions());

    await this.send(embed);
  }
}
