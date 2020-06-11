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

export interface GetRecentTracksResponse {
  recenttracks: RecentTracks;
}
