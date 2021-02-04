import { TagsService } from "../../services/dbservices/tags/TagsService";
import { LastFMService } from "../../services/LastFM/LastFMService";

interface TagsCacheObject {
  [artist: string]: string[];
}

export class TagsCache {
  private cache: TagsCacheObject = {};
  constructor(
    private tagsService: TagsService,
    private lastFMService: LastFMService
  ) {}

  async getTags(artist: string): Promise<string[]> {
    let artistName = artist.toLowerCase();

    if (this.cache[artistName]) return this.cache[artistName];

    const tags =
      (await this.tagsService.getTags(artist)) ||
      (await this.lastFMService.getArtistTags(artist));

    this.cache[artistName] = tags;

    return tags;
  }
}
