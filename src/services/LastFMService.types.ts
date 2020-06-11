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

export interface GetRecentTracksResponse {
  recenttracks: RecentTracks;
}

export interface GetTrackInfoResponse {
  track: {
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
  };
}

export interface GetArtistInfoResponse {
  artist: {
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
      };
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
  };
}
