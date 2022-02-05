import { RedirectsService } from "../../services/dbservices/RedirectsService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { GowonContext } from "../context/Context";

interface RedirectsCacheObject {
  [from: string]: string | undefined;
}

export class RedirectsCache {
  private cache: RedirectsCacheObject = {};
  private redirectsService = ServiceRegistry.get(RedirectsService);

  constructor(private ctx: any) {}

  async initialCache(ctx: GowonContext, artistNames: string[]) {
    this.cache = await this.redirectsService.getRedirectsForArtistsMap(
      ctx,
      artistNames
    );
  }

  async getRedirect(artist: string): Promise<string> {
    let artistName = artist.toLowerCase();

    if (this.cache[artistName]) return this.cache[artistName] || artistName;

    let redirect: string;

    try {
      redirect =
        (await this.redirectsService.checkRedirect(this.ctx, artistName)) ||
        artistName;
    } catch {
      redirect = artistName;
    }

    this.cache[artistName] = redirect;

    return redirect;
  }
}
