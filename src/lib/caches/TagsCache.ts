import { LilacArtistsService } from "../../services/lilac/LilacArtistsService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { GowonContext } from "../context/Context";

interface TagsCacheObject {
  [artist: string]: string[];
}

export class TagsCache {
  private cache: TagsCacheObject = {};
  private lilacArtistsService = ServiceRegistry.get(LilacArtistsService);

  constructor(private ctx: GowonContext) {}

  async initialCache(artistNames: string[], requireTags?: boolean) {
    const artistMap = await this.lilacArtistsService.getTagsForArtistsMap(
      this.ctx,
      artistNames,
      requireTags
    );

    Object.keys(artistMap).map((artist) => {
      this.cache[artist.toLowerCase()] = artistMap[artist];
    });
  }

  async getTags(artist: string): Promise<string[]> {
    const artistName = artist.toLowerCase();

    return this.cache[artistName] || [];
  }
}
