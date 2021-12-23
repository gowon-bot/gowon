import { isKeywords, SpotifySearchParams } from "../SpotifyService";
import {
  RawSearch,
  RawSpotifyAlbum,
  RawSpotifyArtist,
  RawSpotifyTrack,
  SpotifyEntityName,
} from "../SpotifyService.types";
import { SpotifyAlbum } from "./Album";
import { SpotifyArtist } from "./Artist";
import { BaseSpotifyConverter, SpotifyEntityConverter } from "./BaseConverter";
import { SpotifyTrack } from "./Track";

export abstract class BaseSearchResponse<
  TName extends SpotifyEntityName,
  T extends SpotifyEntityConverter<TName>
> extends BaseSpotifyConverter {
  items: T[];
  href: string;
  total: number;

  next?: string;
  previous?: string;

  abstract compareMatch(item: T): boolean;

  constructor(searchResponse: RawSearch<any>, itemClass: { new (i: any): T }) {
    super();

    this.items = searchResponse.items.map((i) => new itemClass(i));
    this.href = searchResponse.href;
    this.total = searchResponse.total;
  }

  get hasAnyResults() {
    return this.total > 0;
  }

  get bestResult() {
    return this.getExactMatch() || this.topResult;
  }

  get topResult() {
    return this.items[0];
  }

  protected getExactMatch() {
    const bestMatch = this.items.find((i) => this.compareMatch.bind(this)(i));

    if (bestMatch) bestMatch.isExactMatch = true;

    return bestMatch;
  }

  protected compare(string1: string, string2: string) {
    return (
      this.cleanBadTags(string1).toLowerCase().trim() ===
      this.cleanBadTags(string2).toLowerCase().trim()
    );
  }

  private cleanBadTags(string: string): string {
    return (
      string
        // To do: replace this with a service that contains all the bad tags (that is easy to add to)
        .replaceAll(
          /(- Remastered .*| - Deluxe| - Single Version| - Album Version)/g,
          ""
        )
        .replaceAll(/'"`‘’:/g, "")
    );
  }
}

export class SpotifyArtistSearch extends BaseSearchResponse<
  "artist",
  SpotifyArtist
> {
  constructor(
    searchResponse: RawSearch<RawSpotifyArtist>,
    private searchArtist: string
  ) {
    super(searchResponse, SpotifyArtist);
  }

  compareMatch(a: SpotifyArtist) {
    return this.compare(a.name, this.searchArtist);
  }
}

export class SpotifyAlbumSearch extends BaseSearchResponse<
  "album",
  SpotifyAlbum
> {
  constructor(
    searchResponse: RawSearch<RawSpotifyAlbum>,
    private params: SpotifySearchParams<{ artist: string; album: string }>
  ) {
    super(searchResponse, SpotifyAlbum);
  }

  compareMatch(l: SpotifyAlbum) {
    if (isKeywords(this.params)) {
      return false;
    }

    const { artist, album } = this.params;

    return (
      this.compare(l.name, album) &&
      l.artists.artists.some((a) => this.compare(a.name, artist))
    );
  }
}

export class SpotifyTrackSearch extends BaseSearchResponse<
  "track",
  SpotifyTrack
> {
  constructor(
    searchResponse: RawSearch<RawSpotifyTrack>,
    private params: SpotifySearchParams<{ artist: string; track: string }>
  ) {
    super(searchResponse, SpotifyTrack);
  }

  compareMatch(t: SpotifyTrack) {
    if (isKeywords(this.params)) {
      return false;
    }

    const { artist, track } = this.params;

    return (
      this.compare(t.name, track) &&
      t.artists.artists.some((a) => this.compare(a.name, artist))
    );
  }
}
