import { ArtistRedirect } from "../../database/entity/ArtistRedirect";
import { DuplicateRecordError, RecordNotFoundError } from "../../errors";
import { BaseService } from "../BaseService";

export class RedirectsService extends BaseService {
  async setRedirect(from: string, to: string): Promise<ArtistRedirect> {
    this.log(`Setting redirect from ${from} to ${to}`);
    if (await ArtistRedirect.findOne({ from }))
      throw new DuplicateRecordError("redirect");

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

  async checkRedirect(artistName: string): Promise<ArtistRedirect | undefined> {
    this.log(`Checking redirects for ${artistName}`);
    return await ArtistRedirect.check(artistName);
  }

  async listRedirects(artistName: string): Promise<ArtistRedirect[]> {
    this.log(`Listing redirects for ${artistName}`);
    return await ArtistRedirect.find({ to: artistName });
  }
}
