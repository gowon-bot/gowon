import { RedirectsService } from "../services/dbservices/RedirectsService";

interface RedirectsCacheObject {
  [from: string]: string;
}

export class RedirectsCache {
  private cache: RedirectsCacheObject = {};
  constructor(private redirectsService: RedirectsService) {}

  async getRedirect(artist: string): Promise<string> {
    if (this.cache[artist]) return this.cache[artist];

    let redirect =
      (await this.redirectsService.checkRedirect(artist))?.to || artist;

    this.cache[artist] = redirect;

    return redirect;
  }
}
