import { GowonContext } from "../../../lib/context/Context";
import { LovedTrackService } from "../../LastFM/LovedTrackService";
import { ServiceRegistry } from "../../ServicesRegistry";
import { IntervaledJob } from "./IntervaledJob";

export class ClearCachedLoveTracks extends IntervaledJob {
  // 2 days
  intervalInSeconds = 172800;

  private get lovedTrackService() {
    return ServiceRegistry.get(LovedTrackService);
  }

  async run(ctx: GowonContext): Promise<void> {
    const expiredTracks =
      await this.lovedTrackService.getExpiredCachedLoveTracks({
        seconds: this.intervalInSeconds,
      });

    for (const expiredTrack of expiredTracks) {
      const success =
        await this.lovedTrackService.attemptResolveCachedLoveTrack(
          ctx,
          {
            artist: expiredTrack.artist,
            track: expiredTrack.track,
            username: expiredTrack.user.asRequestable(),
          },
          expiredTrack.user
        );

      if (!success) {
        await expiredTrack.remove();
      }
    }
  }
}
