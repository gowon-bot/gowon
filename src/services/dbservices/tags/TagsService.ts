import { ILike, In } from "typeorm";
import { ArtistTagCache } from "../../../database/entity/ArtistTagCache";
import { Logger } from "../../../lib/Logger";
import { BaseService } from "../../BaseService";
import { ArtistInfo } from "../../LastFM/converters/InfoTypes";
import { LastFMService } from "../../LastFM/LastFMService";
import { ArtistTagMap, ManyTagsResponse } from "./TagsService.types";

export class TagsService extends BaseService {
  constructor(private lastFMService: LastFMService, logger?: Logger) {
    super(logger);
  }

  async cacheTagsFromArtistInfo(
    artistInfo: ArtistInfo
  ): Promise<ArtistTagCache> {
    return await this.cacheTags(artistInfo.name, artistInfo.tags);
  }

  async cacheTags(artistName: string, tags: string[]): Promise<ArtistTagCache> {
    let tagCache = await this.findOrCreateCache(artistName);

    tagCache.tags = tags;

    await tagCache.save();

    return tagCache;
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

  async getManyTags(artists: string[]): Promise<ManyTagsResponse> {
    const cachedArtists = await ArtistTagCache.find({
      artistName: In(artists),
    });

    const artistsNotFound = [] as string[];
    const map = artists.reduce((mapAcc, artist) => {
      const cachedArtist = cachedArtists.find((ca) => ca.artistName === artist);

      if (cachedArtist) {
        mapAcc[cachedArtist.artistName] = cachedArtist.tags;
      } else {
        artistsNotFound.push(artist);
      }

      return mapAcc;
    }, {} as ArtistTagMap);

    return { map, artistsNotFound };
  }

  async findOrCreateMany(artists: string[]): Promise<ArtistTagMap> {
    const { map, artistsNotFound } = await this.getManyTags(artists);

    for (let artist of artistsNotFound) {
      const artistInfo = await this.lastFMService.artistInfo({ artist });
      const cache = await this.cacheTagsFromArtistInfo(artistInfo);

      map[cache.artistName] = cache.tags;
    }

    return map;
  }

  async countAllCachedArtists(): Promise<number> {
    return await ArtistTagCache.count();
  }

  async cacheTagsForArtistNotFound(artist: string) {
    await this.cacheTags(artist, []);
  }

  async filter<T extends { name: string }>(
    artists: T[],
    allowedTags: string[]
  ): Promise<T[]> {
    allowedTags = allowedTags.map((t) => t.toLowerCase());

    let resultArtists: T[] = [];

    for (let artist of artists) {
      let tags = (await this.getTags(artist.name))?.map((t) => t.toLowerCase());

      if (tags?.filter((t) => allowedTags.includes(t))?.length) {
        resultArtists.push(artist);
      }
    }

    return resultArtists;
  }
}
