import { ILike } from "typeorm";
import { ArtistTagCache } from "../../database/entity/ArtistTagCache";
import { BaseService } from "../BaseService";
import { ArtistInfo } from "../LastFM/LastFMService.types";

export class TagsService extends BaseService {
  async cacheTagsFromArtistInfo(artistInfo: ArtistInfo): Promise<void> {
    let tags = artistInfo.tags.tag.map((t) => t.name);
    let artistName = artistInfo.name;

    await this.cacheTags(artistName, tags);
  }

  async cacheTags(artistName: string, tags: string[]): Promise<void> {
    let tagCache = await this.findOrCreateCache(artistName);

    tagCache.tags = tags;

    await tagCache.save();
  }

  async findOrCreateCache(artistName: string): Promise<ArtistTagCache> {
    let existing = await ArtistTagCache.findOne({ artistName });

    if (existing) return existing;

    let newCache = ArtistTagCache.create({ artistName, tags: [] });

    return await newCache.save();
  }

  async getTags(artistName: string): Promise<string[] | undefined> {
    let cache = await ArtistTagCache.findOne({ artistName: ILike(artistName) });

    return cache?.tags;
  }

  async countAllCachedArtists(): Promise<number> {
    return await ArtistTagCache.count();
  }

  async cacheTagsForArtistNotFound(artist: string) {
    await this.cacheTags(artist, []);
  }
}
