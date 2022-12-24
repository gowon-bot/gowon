import {
  RawBaseSpotifyEntity,
  RawSpotifyURI,
  SpotifyEntityName,
  SpotifyExternalURLs,
  SpotifyImage,
  SpotifyReleaseDatePrecision,
} from "../SpotifyService.types";
import { SpotifyArtist } from "./Artist";

export abstract class BaseSpotifyConverter {}

export type SpotifyID = string;

export class SpotifyURI<T extends SpotifyEntityName> {
  constructor(private string: RawSpotifyURI<T>) {}

  public get asString(): RawSpotifyURI<T> {
    return this.string;
  }

  public get asID(): SpotifyID {
    return this.string.split(":")[2];
  }
}

export class SpotifyArtistCollection {
  constructor(public artists: SpotifyArtist[]) {}

  get primary() {
    return this.artists[0];
  }
}

export class SpotifyImageCollection {
  constructor(public images: SpotifyImage[] = []) {}

  get largest() {
    return this.getLargest(1);
  }

  getLargest(atRank: number) {
    const sortedImages = this.images.sort(
      (a, b) => b.height * b.width - a.height * a.width
    );

    if (sortedImages[atRank - 1]) return sortedImages[atRank - 1];

    return sortedImages[0];
  }
}

export class SpotifyReleaseDate {
  constructor(
    public date: string,
    public precision: SpotifyReleaseDatePrecision
  ) {}
}

export class SpotifyDuration {
  constructor(public ms: number) {}
}

export abstract class SpotifyEntityConverter<
  T extends SpotifyEntityName
> extends BaseSpotifyConverter {
  externalURLs: SpotifyExternalURLs<T>;
  href: string;
  id: string;
  uri: SpotifyURI<T>;
  name: string;
  type: T;

  isExactMatch = false;

  constructor(entity: RawBaseSpotifyEntity<T>) {
    super();

    this.externalURLs = entity.external_urls;
    this.href = entity.href;
    this.id = entity.id;
    this.uri = new SpotifyURI(entity.uri);
    this.name = entity.name;
    this.type = entity.type;
  }
}
