import { TagsService } from "../../services/dbservices/tags/TagsService";

interface TagsCacheObject {
  [artist: string]: string[];
}

export class TagsCache {
  private cache: TagsCacheObject = {};
  constructor(private tagsService: TagsService) {}

  async initialCache(artistNames: string[], requireTags?: boolean) {
    const artistMap = await this.tagsService.getTagsForArtistsMap(
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
