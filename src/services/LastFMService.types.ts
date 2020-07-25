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

export interface TopArtists extends PagedCollection {
  artist: {
    "@attr": { rank: string };
    mbid: string;
    url: string;
    playcount: string;
    image: Image[];
    name: string;
    streamable: string;
  }[];
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
