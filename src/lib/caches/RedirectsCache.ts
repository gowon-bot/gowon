import { RedirectsService } from "../../services/dbservices/RedirectsService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

interface RedirectsCacheObject {
  [from: string]: string;
}

export class RedirectsCache {
  private redirectsService = ServiceRegistry.get(RedirectsService);

  private cache: RedirectsCacheObject = {};

  constructor(private ctx: any) {}

  async getRedirect(artist: string): Promise<string> {
    let artistName = artist.toLowerCase();

    if (this.cache[artistName]) return this.cache[artistName];

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
