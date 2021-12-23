import {
  RawSpotifyTrack,
  SpotifyAvailableMarket,
  SpotifyExternalIDs,
} from "../SpotifyService.types";
import { SpotifyAlbum } from "./Album";
import { SpotifyArtist } from "./Artist";
import {
  SpotifyArtistCollection,
  SpotifyDuration,
  SpotifyEntityConverter,
} from "./BaseConverter";

export class SpotifyTrack extends SpotifyEntityConverter<"track"> {
  album: SpotifyAlbum;
  artists: SpotifyArtistCollection;

  availableMarkets: SpotifyAvailableMarket[];
  duration: SpotifyDuration;
  externalIDs: SpotifyExternalIDs;
  popularity: number;
  previewURL: string;

  isExplicit: boolean;
  isLocal: boolean;

  discNumber: number;
  trackNumber: number;

  constructor(track: RawSpotifyTrack) {
    super(track);

    this.album = new SpotifyAlbum(track.album);
    this.artists = new SpotifyArtistCollection(
      track.artists.map((a) => new SpotifyArtist(a))
    );
    this.availableMarkets = track.available_markets;
    this.discNumber = track.disc_number;
    this.duration = new SpotifyDuration(track.duration_ms);
    this.isExplicit = track.explicit;
    this.isLocal = track.is_local;
    this.externalIDs = track.external_ids;
    this.popularity = track.popularity;
    this.previewURL = track.preview_url;
    this.trackNumber = track.track_number;
  }
}
