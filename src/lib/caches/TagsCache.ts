import { TagsService } from "../../services/mirrorball/services/TagsService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

interface TagsCacheObject {
  [artist: string]: string[];
}

export class TagsCache {
  private cache: TagsCacheObject = {};
  private tagsService = ServiceRegistry.get(TagsService);

  constructor(private ctx: any) {}

  async initialCache(artistNames: string[], requireTags?: boolean) {
    const artistMap = await this.tagsService.getTagsForArtistsMap(
      this.ctx,
      artistNames,
      requireTags
    );

    Object.keys(artistMap).map((artist) => {
      this.cache[artist.toLowerCase()] = artistMap[artist];
    });
  }

  async getTags(artist: string): Promise<string[]> {
    let artistName = artist.toLowerCase();

    return this.cache[artistName] || [];
  }
}
