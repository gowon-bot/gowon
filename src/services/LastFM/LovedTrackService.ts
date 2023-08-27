import { sub } from "date-fns";
import { LessThan } from "typeorm";
import { CachedLovedTrack } from "../../database/entity/CachedLovedTrack";
import { User } from "../../database/entity/User";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";
import { LastFMService } from "./LastFMService";
import { RawTrackInfo, TrackLoveParams } from "./LastFMService.types";

export class LovedTrackService extends BaseService {
  private get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }

  async love(
    ctx: GowonContext,
    {
      params,
      dbUser,
      shouldCache,
    }: { params: TrackLoveParams; dbUser: User; shouldCache: boolean }
  ): Promise<CachedLovedTrack | undefined> {
    await this.lastFMService.love(ctx, params);

    if (shouldCache) {
      return await this.cacheLovedTrack(ctx, params, dbUser);
    }

    return undefined;
  }

  async unlove(
    ctx: GowonContext,
    params: TrackLoveParams,
    dbUser: User
  ): Promise<CachedLovedTrack | undefined> {
    const cachedLovedTrack = await this.getCachedLovedTrack(
      ctx,
      params,
      dbUser
    );

    await cachedLovedTrack?.remove();

    await this.lastFMService.unlove(ctx, params);

    return cachedLovedTrack;
  }

  async getCachedLovedTrack(
    ctx: GowonContext,
    params: TrackLoveParams,
    dbUser: User
  ): Promise<CachedLovedTrack | undefined> {
    this.log(
      ctx,
      `Fetching cached loved track for ${params.artist} - ${params.track}`
    );

    return (
      (await CachedLovedTrack.findOneBy({
        artist: params.artist,
        track: params.track,
        user: { id: dbUser.id },
      })) ?? undefined
    );
  }

  async resolveCache(trackInfo: RawTrackInfo): Promise<void> {
    const cachedLovedTracks = await CachedLovedTrack.findBy({
      artist: trackInfo.artist.name,
      track: trackInfo.name,
    });

    await CachedLovedTrack.remove(cachedLovedTracks);
  }

  async getExpiredCachedLoveTracks(
    expiryPeriod: Duration
  ): Promise<CachedLovedTrack[]> {
    const expiredDate = sub(new Date(), expiryPeriod);

    return await CachedLovedTrack.findBy({
      createdAt: LessThan(expiredDate),
    });
  }

  private async cacheLovedTrack(
    ctx: GowonContext,
    params: TrackLoveParams,
    dbUser: User
  ): Promise<CachedLovedTrack> {
    const existing = await this.getCachedLovedTrack(ctx, params, dbUser);

    if (existing) return existing;

    const cachedLovedTrack = CachedLovedTrack.create({
      ...params,
      user: dbUser,
    });

    cachedLovedTrack.new = true;

    return await cachedLovedTrack.save();
  }
}
