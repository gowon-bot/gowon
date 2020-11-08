import { RedirectsService } from "../../services/dbservices/RedirectsService";

interface RedirectsCacheObject {
  [from: string]: string;
}

export class RedirectsCache {
  private cache: RedirectsCacheObject = {};
  constructor(private redirectsService: RedirectsService) {}

  async getRedirect(artist: string): Promise<string> {
    let artistName = artist.toLowerCase();

    if (this.cache[artistName]) return this.cache[artistName];

    let redirect =
      (await this.redirectsService.checkRedirect(artistName)) || artistName;

    this.cache[artistName] = redirect;

    return redirect;
  }
}
