export interface ArtistTagMap {
  [artist: string]: string[];
}

export interface ManyTagsResponse {
  map: ArtistTagMap;
  artistsNotFound: string[];
}
