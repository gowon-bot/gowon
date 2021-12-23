import {
  RawSpotifyAlbum,
  SpotifyAlbumType,
  SpotifyAvailableMarket,
  SpotifyRestrictionReason,
} from "../SpotifyService.types";
import { SpotifyArtist } from "./Artist";
import {
  SpotifyArtistCollection,
  SpotifyEntityConverter,
  SpotifyImageCollection,
  SpotifyReleaseDate,
} from "./BaseConverter";

export class SpotifyAlbum extends SpotifyEntityConverter<"album"> {
  albumType: SpotifyAlbumType;
  artists: SpotifyArtistCollection;
  availableMarkets: SpotifyAvailableMarket[];
  images: SpotifyImageCollection;
  releaseDate: SpotifyReleaseDate;
  restriction?: SpotifyRestrictionReason;
  totalTracks: number;

  constructor(album: RawSpotifyAlbum) {
    super(album);

    this.albumType = album.album_type;
    this.artists = new SpotifyArtistCollection(
      album.artists.map((a) => new SpotifyArtist(a))
    );
    this.availableMarkets = album.available_markets;
    this.images = new SpotifyImageCollection(album.images);
    this.releaseDate = new SpotifyReleaseDate(
      album.release_date,
      album.release_date_precision
    );
    this.restriction = album.restrictions?.reason;
    this.totalTracks = album.total_tracks;
  }
}
