import { RawSpotifyArtist } from "../SpotifyService.types";
import {
  SpotifyEntityConverter,
  SpotifyImageCollection,
} from "./BaseConverter";

export class SpotifyArtist extends SpotifyEntityConverter<"artist"> {
  genres: string[];
  followers: number;
  popularity: number;
  images: SpotifyImageCollection;

  constructor(artist: RawSpotifyArtist) {
    super(artist);

    this.genres = artist.genres;
    this.followers = artist.followers?.total;
    this.popularity = artist.popularity;

    this.images = new SpotifyImageCollection(artist.images);
  }
}
