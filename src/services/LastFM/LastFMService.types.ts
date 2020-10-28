// Responses

export interface PagedCollection {
  "@attr": {
    page: string;
    total: string;
    user: string;
    perPage: string;
    totalPages: string;
  };
}

export interface Image {
  size: string;
  "#text": string;
}

export interface Tag {
  name: string;
  url: string;
}

export interface Track {
  artist: { mbid: string; "#text": string };
  "@attr": { nowplaying: string };
  mbid: string;
  album: { mbid: string; "#text": string };
  image: Image[];
  streamable: string;
  url: string;
  name: string;
}

export interface RecentTracks extends PagedCollection {
  track: Track[];
}

export interface RecentTracksResponse {
  recenttracks: RecentTracks;
}

export interface TrackInfo {
  name: string;
  mbid: string;
  url: string;
  duration: string;
  streamable: { "#text": string; fulltrack: string };
  listeners: string;
  playcount: string;
  artist: {
    name: string;
    mbid: string;
    url: string;
  };
  album: {
    artist: string;
    title: string;
    mbid: string;
    url: string;
    "@attr": { position: string };
    image: Image[];
  };
  userplaycount: string;
  userloved: string;
  toptags: { tag: Tag[] };
  wiki?: {
    published: string;
    summary: string;
    content: string;
  };
}

export interface TrackInfoResponse {
  track: TrackInfo;
}

export interface ArtistInfo {
  name: string;
  url: string;
  streamable: string;
  ontour: string;
  stats: { listeners: string; playcount: string; userplaycount: string };
  similar: {
    artist: {
      name: string;
      url: string;
      image: Image[];
    }[];
  };
  tags: { tag: Tag[] };
  bio: {
    links: {
      link: {
        "#text": string;
        rel: string;
        href: string;
      };
    };
    published: string;
    summary: string;
    content: string;
  };
}
export interface ArtistInfoResponse {
  artist: ArtistInfo;
}

export interface AlbumInfo {
  name: string;
  artist: string;
  url: string;
  image: Image[];
  listeners: string;
  playcount: string;
  userplaycount: string;
  tracks: {
    track: [
      {
        name: string;
        url: string;
        duration: string;
        "@attr": { rank: string };
        streamable: { "#text": string; fulltrack: string };
        artist: {
          name: string;
          mbid: string;
          url: string;
        };
      }
    ];
  };
  tags: { tag: Tag[] };
  wiki?: {
    published: string;
    summary: string;
    content: string;
  };
}
export interface AlbumInfoResponse {
  album: AlbumInfo;
}

export interface UserInfo {
  playlists: string;
  playcount: string;
  gender: string;
  name: string;
  subscriber: string;
  url: string;
  country: string;
  image: Image[];
  registered: { unixtime: string; "#text": number };
  type: string;
  age: string;
  bootstrap: string;
  realname: string;
}
export interface UserInfoResponse {
  user: UserInfo;
}

export interface LastFMErrorResponse {
  error: number;
  message: string;
}

export interface TopArtist {
  "@attr": { rank: string };
  mbid: string;
  url: string;
  playcount: string;
  image: Image[];
  name: string;
  streamable: string;
}
export interface TopArtists extends PagedCollection {
  artist: TopArtist[];
}
export interface TopArtistsResponse {
  topartists: TopArtists;
}

export interface TopAlbums extends PagedCollection {
  album: {
    artist: {
      url: string;
      name: string;
      mbid: string;
    };
    "@attr": { rank: string };
    image: Image[];
    playcount: string;
    url: string;
    name: string;
    mbid: string;
  }[];
  "@attr": {
    page: string;
    total: string;
    user: string;
    perPage: string;
    totalPages: string;
  };
}

export interface TopAlbumsResponse {
  topalbums: TopAlbums;
}

export interface TopTracks extends PagedCollection {
  "@attr": {
    page: string;
    total: string;
    user: string;
    perPage: string;
    totalPages: string;
  };
  track: {
    "@attr": { rank: string };
    duration: string;
    playcount: string;
    artist: {
      url: string;
      name: string;
      mbid: string;
    };
    image: Image[];
    streamable: { fulltrack: string; "#text": string };
    mbid: string;
    name: string;
    url: string;
  }[];
}

export interface TopTracksResponse {
  toptracks: TopTracks;
}

export interface TagInfo {
  name: string;
  total: number;
  reach: number;
  wiki: {
    summary: string;
    content: string;
  };
}

export interface TagInfoResponse {
  tag: TagInfo;
}

export interface ArtistTopTracks extends PagedCollection {
  track: [
    {
      name: string;
      playcount: string;
      listeners: string;
      url: string;
      streamable: string;
      artist: {
        name: string;
        mbid: string;
        url: string;
      };
      image: Image[];
      "@attr": {
        rank: string;
      };
    }
  ];
}

export interface ArtistTopTracksResponse {
  toptracks: ArtistTopTracks;
}

export interface TagTopArtistsResponse {
  topartists: TagTopArtists;
}

export interface TagTopArtists {
  artist: {
    name: string;
    url: string;
    streamable: "0" | "1";
    image: Image[];
    "@attr": {
      rank: string;
    };
  }[];
  "@attr": {
    tag: string;
    page: string;
    perPage: string;
    totalPages: string;
    total: string;
  };
}

export interface TrackSearchResponse {
  results: {
    "opensearch:Query": {
      "#text": string;
      role: "request";
      startPage: string;
    };
    "opensearch:totalResults": string;
    "opensearch:startIndex": string;
    "opensearch:itemsPerPage": string;
    trackmatches: {
      track: {
        name: string;
        artist: string;
        url: string;
        streamable: "FIXME";
        listeners: "46498";
        image: Image[];
        mbid: string;
      }[];
    };
    "@attr": {};
  };
}

export interface GetArtistCorrectionResponse {
  corrections?: {
    correction: {
      artist: ArtistCorrection;
      "@attr": {
        index: string;
      };
    };
  };
}

export interface ArtistCorrection {
  name: string;
  mbid: string;
  url: string;
}

/// ==================
// Inputs
/// ==================

export interface Params {}

export interface UsernameParams {
  username?: string;
}

export interface TimeframeParams {
  from?: number;
  to?: number;
}

export interface PagedParams {
  limit?: number;
  page?: number;
}

export type LastFMPeriod =
  | "overall"
  | "7day"
  | "1month"
  | "3month"
  | "6month"
  | "12month";

export interface TimePeriodParams {
  period?: LastFMPeriod;
}

export interface RecentTracksParams
  extends UsernameParams,
    TimeframeParams,
    PagedParams {
  extended?: 0 | 1;
}

export interface TrackInfoParams extends UsernameParams {
  track: string;
  artist: string;
  autocorrect?: 0 | 1;
}

export interface ArtistInfoParams extends UsernameParams {
  artist: string;
  autocorrect?: 0 | 1;
  lang?: string;
}

export interface AlbumInfoParams extends UsernameParams {
  artist: string;
  album: string;
  autocorrect?: 0 | 1;
  lang?: string;
}

export interface UserInfoParams extends UsernameParams {}

export interface TagInfoParams {
  tag: string;
  lang?: string;
}

export interface TopArtistsParams
  extends UsernameParams,
    TimePeriodParams,
    PagedParams {}

export interface TopTracksParams
  extends UsernameParams,
    TimePeriodParams,
    PagedParams {}

export interface TopAlbumsParams
  extends UsernameParams,
    TimePeriodParams,
    PagedParams {}

export interface ArtistTopTracksParams extends PagedParams {
  artist: string;
  autocorrect?: 0 | 1;
}

export interface TagTopArtistsParams extends PagedParams {
  tag: string;
}

export interface TrackSearchParams extends PagedParams {
  track: string;
  artist?: string;
}

export interface ScrobbleParams {
  artist: string;
  track: string;
  timestamp: number;

  album?: string;
  albumArtist?: string;
  duration?: number;
}

export interface GetSessionParams {
  token: string;
}

export interface GetArtistCorrectionParams {
  artist: string;
}
