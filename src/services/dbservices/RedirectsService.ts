import { ArtistRedirect } from "../../database/entity/ArtistRedirect";
import { RecordNotFoundError } from "../../errors/errors";
import { GowonContext } from "../../lib/context/Context";
import { displayNumber } from "../../lib/views/displays";
import { BaseService } from "../BaseService";
import { LastFMService } from "../LastFM/LastFMService";
import { ServiceRegistry } from "../ServicesRegistry";

export class RedirectsService extends BaseService {
  get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }

  async setRedirect(
    ctx: GowonContext,
    from: string,
    to?: string
  ): Promise<ArtistRedirect> {
    this.log(
      ctx,
      to
        ? `Setting redirect from ${from} to ${to}`
        : `Marking ${from} as no redirect`
    );

    const redirect = ArtistRedirect.create({ from, to });

    return await redirect.save();
  }

  async removeRedirect(
    ctx: GowonContext,
    from: string
  ): Promise<ArtistRedirect> {
    this.log(ctx, `Removing redirect from ${from}`);
    const redirect = await ArtistRedirect.findOneBy({ from });

    if (!redirect) throw new RecordNotFoundError("redirect");

    await redirect.remove();

    return redirect;
  }

  async getRedirect(
    ctx: GowonContext,
    artistName: string
  ): Promise<ArtistRedirect> {
    this.log(ctx, `Fetching redirect for ${artistName}`);

    const redirect = await ArtistRedirect.check(artistName);

    if (!redirect) {
      return await this.createRedirect(ctx, artistName);
    } else return redirect;
  }

  async checkRedirect(ctx: GowonContext, artistName: string): Promise<string> {
    const redirect = await this.getRedirect(ctx, artistName);

    return redirect?.to || redirect?.from!;
  }

  async listRedirects(
    ctx: GowonContext,
    artistName: string
  ): Promise<ArtistRedirect[]> {
    this.log(ctx, `Listing redirects for ${artistName}`);

    return await ArtistRedirect.findBy({ to: artistName });
  }

  async countAllRedirects(ctx: GowonContext): Promise<number> {
    this.log(ctx, `Counting all redirects`);

    return await ArtistRedirect.count();
  }

  async getRedirectsForArtistsMap(
    ctx: GowonContext,
    artists: string[]
  ): Promise<{ [artistName: string]: string }> {
    this.log(
      ctx,
      `Getting redirects for ${displayNumber(artists.length, "artist")}`
    );

    const map: { [artistName: string]: string } = {};

    const redirects = await ArtistRedirect.createQueryBuilder("artist_redirect")
      .where("LOWER(artist_redirect.from) IN (:...artists)", {
        artists: artists.map((a) => a.toLowerCase()),
      })
      .getMany();

    for (const redirect of redirects) {
      map[redirect.from.toLowerCase()] = redirect.to || redirect.from;
    }

    for (const artist of artists) {
      if (!map[artist.toLowerCase()]) {
        const redirect = await this.createRedirect(ctx, artist);

        map[artist.toLowerCase()] = redirect?.to || redirect?.from;
      }
    }

    return map;
  }

  private async createRedirect(
    ctx: GowonContext,
    artistName: string
  ): Promise<ArtistRedirect> {
    try {
      const lastFMRedirect = await this.lastFMService.getArtistCorrection(ctx, {
        artist: artistName,
      });

      if (lastFMRedirect.name.toLowerCase() === artistName.toLowerCase()) {
        const newRedirect = await this.setRedirect(ctx, lastFMRedirect.name);

        return newRedirect;
      } else {
        const newRedirect = await this.setRedirect(
          ctx,
          artistName,
          lastFMRedirect.name
        );

        return newRedirect;
      }
    } catch (e: any) {
      if (e.name === "LastFMError:6") {
        return ArtistRedirect.create({ from: artistName });
      } else throw e;
    }
  }
}
