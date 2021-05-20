import {
  ArtistCorrection,
  ArtistPopularTrack,
  ArtistPopularTracks,
  Friends,
  SearchedTrack,
  TagTopArtist,
  TagTopArtists,
  TagTopTrack,
  TagTopTracks,
  TrackSearchResponse,
  UserInfo,
} from "../LastFMService.types";
import { BaseConverter, ImageCollection } from "./BaseConverter";
import { ConvertedUserInfo } from "./InfoTypes";

export class ConvertedArtistPopularTrack extends BaseConverter {
  name: string;
  globalPlaycount: number;
  listeners: number;
  url: string;
  streamable: boolean;
  artist: {
    name: string;
    mbid: string;
    url: string;
  };
  images: ImageCollection;
  rank: number;

  constructor(track: ArtistPopularTrack) {
    super();

    this.name = track.name;
    this.globalPlaycount = this.number(track.playcount);
    this.listeners = this.number(track.listeners);
    this.url = track.url;
    this.streamable = this.boolean(track.streamable);
    this.artist = track.artist;
    this.images = new ImageCollection(track.image);
    this.rank = this.number(track["@attr"].rank);
  }
}

export class ConvertedArtistPopularTracks extends BaseConverter {
  tracks: ConvertedArtistPopularTrack[];
  meta: {
    artist: string;
    page: number;
    total: number;
    perPage: number;
    totalPages: number;
  };

  constructor(popularTracks: ArtistPopularTracks) {
    super();

    const attr = popularTracks["@attr"];

    this.tracks = popularTracks.track.map(
      (t) => new ConvertedArtistPopularTrack(t)
    );

    this.meta = {
      artist: (attr as any).artist,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }
}

export class ConvertedTagTopArtist extends BaseConverter {
  name: string;
  url: string;
  streamable: boolean;
  images: ImageCollection;
  rank: number;

  constructor(tagTopArtist: TagTopArtist) {
    super();

    this.name = tagTopArtist.name;
    this.url = tagTopArtist.url;
    this.streamable = this.boolean(tagTopArtist.streamable);
    this.images = new ImageCollection(tagTopArtist.image);
    this.rank = this.number(tagTopArtist["@attr"].rank);
  }
}

export class ConvertedTagTopArtists extends BaseConverter {
  artists: ConvertedTagTopArtist[];
  meta: {
    tag: string;
    page: number;
    perPage: number;
    totalPages: number;
    total: number;
  };

  constructor(tagTopArtists: TagTopArtists) {
    super();

    const attr = tagTopArtists["@attr"];

    this.artists = tagTopArtists.artist.map(
      (a) => new ConvertedTagTopArtist(a)
    );

    this.meta = {
      tag: attr.tag,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }
}

export class ConvertedSearchedTrack extends BaseConverter {
  name: string;
  artist: string;
  url: string;
  streamable: "FIXME";
  listeners: number;
  image: ImageCollection;
  mbid: string;

  constructor(searchedTrack: SearchedTrack) {
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

export class ConvertedTrackSearch extends BaseConverter {
  tracks: ConvertedSearchedTrack[];
  meta: {
    query: string;
    startPage: number;
    total: number;
    perPage: number;
  };

  constructor(trackSearch: TrackSearchResponse) {
    super();

    this.tracks = trackSearch.results.trackmatches.track.map(
      (t) => new ConvertedSearchedTrack(t)
    );

    this.meta = {
      query: trackSearch.results["opensearch:Query"]["#text"],
      startPage: this.number(trackSearch.results["opensearch:Query"].startPage),
      total: this.number(trackSearch.results["opensearch:totalResults"]),
      perPage: this.number(trackSearch.results["opensearch:itemsPerPage"]),
    };
  }
}

export class ConvertedArtistCorrection extends BaseConverter {
  name: string;
  mbid: string;
  url: string;

  constructor(artistCorrection: ArtistCorrection) {
    super();

    this.name = artistCorrection.name;
    this.mbid = artistCorrection.mbid;
    this.url = artistCorrection.url;
  }
}

export class ConvertedFriends extends BaseConverter {
  friends: ConvertedUserInfo[];
  meta: {
    user: string;
    page: number;
    perPage: number;
    totalPages: number;
    total: number;
  };

  constructor(friends: Friends) {
    super();

    const attr = friends["@attr"];

    this.friends = friends.user.map(
      // a friend and user info are identical except friends are missing `gender`
      (f) => new ConvertedUserInfo(f as any as UserInfo)
    );

    this.meta = {
      user: attr.user,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }
}

export class ConvertedTagTopTrack extends BaseConverter {
  name: string;
  duration: number;
  mbid: string;
  url: string;
  artist: {
    name: string;
    mbid: string;
    url: string;
  };
  images: ImageCollection;
  rank: number;

  constructor(tagTopTrack: TagTopTrack) {
    super();

    this.name = tagTopTrack.name;
    this.duration = this.number(tagTopTrack.duration);
    this.url = tagTopTrack.url;
    this.mbid = tagTopTrack.mbid;
    this.artist = tagTopTrack.artist;
    this.images = new ImageCollection(tagTopTrack.image);
    this.rank = this.number(tagTopTrack["@attr"].rank);
  }
}

export class ConvertedTagTopTracks extends BaseConverter {
  tracks: ConvertedTagTopTrack[];
  meta: {
    tag: string;
    page: number;
    perPage: number;
    totalPages: number;
    total: number;
  };

  constructor(tagTopTracks: TagTopTracks) {
    super();

    const attr = tagTopTracks["@attr"];

    this.tracks = tagTopTracks.track.map((t) => new ConvertedTagTopTrack(t));

    this.meta = {
      tag: attr.tag,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }
}
