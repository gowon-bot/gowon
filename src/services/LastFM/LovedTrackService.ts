import { sub } from "date-fns";
import { LessThan } from "typeorm";
import { CachedLovedTrack } from "../../database/entity/CachedLovedTrack";
import { User } from "../../database/entity/User";
import { LastFMError, TrackDoesNotExistError } from "../../errors/errors";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";
import { UsersService } from "../dbservices/UsersService";
import { LastFMArgumentsMutableContext } from "./LastFMArguments";
import { LastFMService } from "./LastFMService";
import { TrackInfoParams, TrackLoveParams } from "./LastFMService.types";

export class LovedTrackService extends BaseService {
  private get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }
  private get usersService() {
    return ServiceRegistry.get(UsersService);
  }

  async love(
    ctx: GowonContext,
    params: TrackLoveParams,
    dbUser: User
  ): Promise<CachedLovedTrack | undefined> {
    await this.lastFMService.love(ctx, params);

    const mutableContext = ctx.getMutable<LastFMArgumentsMutableContext>();

    if (!(await this.isTrackLoved(ctx, params))) {
      if (!mutableContext.nowplaying && !mutableContext.parsedNowplaying) {
        throw new TrackDoesNotExistError();
      }

      return await this.cacheLovedTrack(ctx, params, dbUser);
    } else return undefined;
  }

  async unlove(
    ctx: GowonContext,
    params: TrackLoveParams,
    dbUser: User
  ): Promise<{ wasCached: boolean }> {
    const cachedLovedTrack = await this.getCachedLovedTrack(
      ctx,
      params,
      dbUser
    );

    if (cachedLovedTrack) {
      await cachedLovedTrack.remove();
      return { wasCached: true };
    } else {
      await this.lastFMService.unlove(ctx, params);
      return { wasCached: false };
    }
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

  async attemptResolveCachedLoveTrack(
    ctx: GowonContext,
    params: TrackInfoParams,
    dbUser?: User
  ): Promise<boolean> {
    const user =
      dbUser || (await this.usersService.getUser(ctx, ctx.author.id));
    const cachedLovedTrack = await this.getCachedLovedTrack(ctx, params, user);

    if (!cachedLovedTrack) return false;

    this.lastFMService.love(ctx, params);

    if (await this.isTrackLoved(ctx, params)) {
      await cachedLovedTrack.remove();

      return true;
    } else return false;
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

    return await cachedLovedTrack.save();
  }

  private wasTrackNotLoved(e: unknown): boolean {
    return e instanceof LastFMError && e.response.error === 6;
  }

  private async isTrackLoved(
    ctx: GowonContext,
    params: TrackLoveParams
  ): Promise<boolean> {
    try {
      // Use the raw request to skip the attempt to love the track
      const response = await this.lastFMService._trackInfo(ctx, params);

      return response.userloved === "1";
    } catch (e) {
      if (!this.wasTrackNotLoved(e)) throw e;
      return false;
    }
  }
}
