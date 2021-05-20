import { ArtistRedirect } from "../../database/entity/ArtistRedirect";
import { RecordNotFoundError } from "../../errors";
import { BaseService } from "../BaseService";
import { LastFMService } from "../LastFM/LastFMService";

export class RedirectsService extends BaseService {
  lastFMService = new LastFMService(this.logger);

  async setRedirect(from: string, to?: string): Promise<ArtistRedirect> {
    this.log(
      to
        ? `Setting redirect from ${from} to ${to}`
        : `Marking ${from} as no redirect`
    );

    let redirect = ArtistRedirect.create({ from, to });

    return await redirect.save();
  }

  async removeRedirect(from: string): Promise<ArtistRedirect> {
    this.log(`Removing redirect from ${from}`);
    let redirect = await ArtistRedirect.findOne({ from });

    if (!redirect) throw new RecordNotFoundError("redirect");

    await redirect.remove();

    return redirect;
  }

  async getRedirect(artistName: string): Promise<ArtistRedirect | undefined> {
    let redirect = await ArtistRedirect.check(artistName);

    if (!redirect) {
      try {
        let lastFMRedirect = await this.lastFMService.getArtistCorrection({
          artist: artistName,
        });

        if (lastFMRedirect.name.toLowerCase() === artistName.toLowerCase()) {
          let newRedirect = await this.setRedirect(lastFMRedirect.name);
          return newRedirect;
        } else {
          let newRedirect = await this.setRedirect(
            artistName,
            lastFMRedirect.name
          );
          return newRedirect;
        }
      } catch (e) {
        if (e.name === "LastFMError") return undefined;
        else throw e;
      }
    } else return redirect;
  }

  async checkRedirect(artistName: string): Promise<string> {
    let redirect = await this.getRedirect(artistName);

    return redirect?.to || redirect?.from!;
  }

  async listRedirects(artistName: string): Promise<ArtistRedirect[]> {
    this.log(`Listing redirects for ${artistName}`);
    return await ArtistRedirect.find({ to: artistName });
  }

  async countAllRedirects(): Promise<number> {
    return await ArtistRedirect.count();
  }
}
