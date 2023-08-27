import { CachedLovedTrack } from "../../../database/entity/CachedLovedTrack";
import { GowonContext } from "../../../lib/context/Context";
import { LastFMService } from "../../LastFM/LastFMService";
import { LovedTrackService } from "../../LastFM/LovedTrackService";
import { ServiceRegistry } from "../../ServicesRegistry";
import { IntervaledJob } from "./IntervaledJob";

export class ClearCachedLoveTracks extends IntervaledJob {
  // 2 days
  intervalInSeconds = 172800;

  private get lovedTrackService() {
    return ServiceRegistry.get(LovedTrackService);
  }

  private get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }

  async run(ctx: GowonContext): Promise<void> {
    const expiredTracks =
      await this.lovedTrackService.getExpiredCachedLoveTracks({
        seconds: this.intervalInSeconds,
      });

    for (const expiredTrack of expiredTracks) {
      if (expiredTrack.isPending()) {
        await this.attemptToResolveCache(ctx, expiredTrack);
      } else if (expiredTrack.isExpired()) {
        await CachedLovedTrack.remove(expiredTrack);
      }
    }
  }

  private async attemptToResolveCache(
    ctx: GowonContext,
    expiredTrack: CachedLovedTrack
  ) {
    try {
      const trackInfo = await this.lastFMService._trackInfo(ctx, {
        artist: expiredTrack.artist,
        track: expiredTrack.track,
      });

      await this.lovedTrackService.resolveCache(trackInfo);
    } catch {}
  }
}
