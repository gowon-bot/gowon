import { ArtistRedirect } from "../../database/entity/ArtistRedirect";
import { RecordNotFoundError } from "../../errors";
import { displayNumber } from "../../lib/views/displays";
import { BaseService, BaseServiceContext } from "../BaseService";
import { LastFMService } from "../LastFM/LastFMService";
import { ServiceRegistry } from "../ServicesRegistry";

export class RedirectsService extends BaseService {
  get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }

  async setRedirect(
    ctx: BaseServiceContext,
    from: string,
    to?: string
  ): Promise<ArtistRedirect> {
    this.log(
      ctx,
      to
        ? `Setting redirect from ${from} to ${to}`
        : `Marking ${from} as no redirect`
    );

    let redirect = ArtistRedirect.create({ from, to });

    return await redirect.save();
  }

  async removeRedirect(
    ctx: BaseServiceContext,
    from: string
  ): Promise<ArtistRedirect> {
    this.log(ctx, `Removing redirect from ${from}`);
    let redirect = await ArtistRedirect.findOne({ from });

    if (!redirect) throw new RecordNotFoundError("redirect");

    await redirect.remove();

    return redirect;
  }

  async getRedirect(
    ctx: BaseServiceContext,
    artistName: string
  ): Promise<ArtistRedirect | undefined> {
    this.log(ctx, `Fetching redirect for ${artistName}`);

    let redirect = await ArtistRedirect.check(artistName);

    if (!redirect) {
      return await this.createRedirect(ctx, artistName);
    } else return redirect;
  }

  async checkRedirect(
    ctx: BaseServiceContext,
    artistName: string
  ): Promise<string> {
    let redirect = await this.getRedirect(ctx, artistName);

    return redirect?.to || redirect?.from!;
  }

  async listRedirects(
    ctx: BaseServiceContext,
    artistName: string
  ): Promise<ArtistRedirect[]> {
    this.log(ctx, `Listing redirects for ${artistName}`);

    return await ArtistRedirect.find({ to: artistName });
  }

  async countAllRedirects(ctx: BaseServiceContext): Promise<number> {
    this.log(ctx, `Counting all redirects`);

    return await ArtistRedirect.count();
  }

  async getRedirectsForArtistsMap(
    ctx: BaseServiceContext,
    artists: string[]
  ): Promise<{ [artistName: string]: string | undefined }> {
    this.log(
      ctx,
      `Getting redirects for ${displayNumber(artists.length, "artist")}`
    );

    const map: { [artistName: string]: string | undefined } = {};

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
    ctx: BaseServiceContext,
    artistName: string
  ): Promise<ArtistRedirect | undefined> {
    try {
      const lastFMRedirect = await this.lastFMService.getArtistCorrection(ctx, {
        artist: artistName,
      });

      if (lastFMRedirect.name.toLowerCase() === artistName.toLowerCase()) {
        let newRedirect = await this.setRedirect(ctx, lastFMRedirect.name);
        return newRedirect;
      } else {
        let newRedirect = await this.setRedirect(
          ctx,
          artistName,
          lastFMRedirect.name
        );
        return newRedirect;
      }
    } catch (e) {
      if (e.name === "LastFMError:6") return undefined;
      else throw e;
    }
  }
}
