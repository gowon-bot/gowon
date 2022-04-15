import {
  RawAlbumSearchResponse,
  RawSearchedAlbum,
  RawSearchedTrack,
  RawTrackSearchResponse,
} from "../LastFMService.types";
import { BaseLastFMConverter, ImageCollection } from "./BaseConverter";

export class SearchedAlbum extends BaseLastFMConverter {
  name: string;
  artist: string;
  url: string;
  streamable: string;
  images: ImageCollection;
  mbid: string;

  constructor(searchedAlbum: RawSearchedAlbum) {
    super();

    this.name = searchedAlbum.name;
    this.artist = searchedAlbum.artist;
    this.url = searchedAlbum.url;
    this.streamable = searchedAlbum.streamable;
    this.images = new ImageCollection(searchedAlbum.image);
    this.mbid = searchedAlbum.mbid;
  }
}

export class AlbumSearch extends BaseLastFMConverter {
  albums: SearchedAlbum[];
  meta: {
    query: string;
    startPage: number;
    total: number;
    perPage: number;
  };

  constructor(albumSearch: RawAlbumSearchResponse) {
    super();

    this.albums = albumSearch.results.albummatches.album.map(
      (t) => new SearchedAlbum(t)
    );

    this.meta = {
      query: albumSearch.results["opensearch:Query"]["#text"],
      startPage: this.number(albumSearch.results["opensearch:Query"].startPage),
      total: this.number(albumSearch.results["opensearch:totalResults"]),
      perPage: this.number(albumSearch.results["opensearch:itemsPerPage"]),
    };
  }
}

export class SearchedTrack extends BaseLastFMConverter {
  name: string;
  artist: string;
  url: string;
  streamable: "FIXME";
  listeners: number;
  image: ImageCollection;
  mbid: string;

  constructor(searchedTrack: RawSearchedTrack) {
    super();

    this.name = searchedTrack.name;
    this.artist = searchedTrack.artist;
    this.url = searchedTrack.url;
    this.streamable = searchedTrack.streamable;
    this.listeners = this.number(searchedTrack.listeners);
    this.image = new ImageCollection(searchedTrack.image);
    this.mbid = searchedTrack.mbid;
  }
}

export class TrackSearch extends BaseLastFMConverter {
  tracks: SearchedTrack[];
  meta: {
    query: string;
    startPage: number;
    total: number;
    perPage: number;
  };

  constructor(trackSearch: RawTrackSearchResponse) {
    super();

    this.tracks = trackSearch.results.trackmatches.track.map(
      (t) => new SearchedTrack(t)
    );

    this.meta = {
      query: trackSearch.results["opensearch:Query"]["#text"],
      startPage: this.number(trackSearch.results["opensearch:Query"].startPage),
      total: this.number(trackSearch.results["opensearch:totalResults"]),
      perPage: this.number(trackSearch.results["opensearch:itemsPerPage"]),
    };
  }
}
