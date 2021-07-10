import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  AlbumInput,
  ArtistInput,
  MirrorballPageInfo,
  MirrorballRateYourMusicAlbum,
  UserInput,
} from "../../../../services/indexing/IndexingTypes";

// ImportRatings
export interface ImportRatingsResponse {
  importRatings: {};
}

export interface ImportRatingsParams {
  user: UserInput;
  csv: string;
}

export class ImportRatingsConnector extends BaseConnector<
  ImportRatingsResponse,
  ImportRatingsParams
> {
  query = gql`
    mutation importRatings($user: UserInput!, $csv: String!) {
      importRatings(user: $user, csv: $csv)
    }
  `;
}

// Rating
export interface RatingResponse {
  ratings: {
    ratings: [
      {
        rating: number;
        rateYourMusicAlbum: MirrorballRateYourMusicAlbum;
      }
    ];
  };
  pageInfo: MirrorballPageInfo;
}

export interface RatingParams {
  user: UserInput;
  album: AlbumInput;
}

export class RatingConnector extends BaseConnector<
  RatingResponse,
  RatingParams
> {
  query = gql`
    query rating($user: UserInput, $album: AlbumInput) {
      ratings(
        settings: { user: $user, album: $album, pageInput: { limit: 1 } }
      ) {
        ratings {
          rating
          rateYourMusicAlbum {
            title
            artistName
          }
        }
        pageInfo {
          recordCount
        }
      }
    }
  `;
}

// ArtistRatings
export interface ArtistRatingsResponse {
  ratings: {
    ratings: {
      rating: number;
      rateYourMusicAlbum: MirrorballRateYourMusicAlbum;
    }[];
  };
  artist?: {
    artistName: string;
    artistNativeName: string;
  };
}

export interface ArtistRatingsParams {
  user: UserInput;
  artist: ArtistInput;
  artistKeywords: string;
}

export class ArtistRatingsConnector extends BaseConnector<
  ArtistRatingsResponse,
  ArtistRatingsParams
> {
  query = gql`
    query artistRatings(
      $user: UserInput
      $artist: ArtistInput
      $artistKeywords: String!
    ) {
      ratings(settings: { user: $user, album: { artist: $artist } }) {
        ratings {
          rating
          rateYourMusicAlbum {
            title
            artistName
          }
        }
      }

      artist: rateYourMusicArtist(keywords: $artistKeywords) {
        artistName
        artistNativeName
      }
    }
  `;
}

// Stats
export interface StatsResponse {
  ratings: {
    ratings: {
      rating: number;
      rateYourMusicAlbum: MirrorballRateYourMusicAlbum;
    }[];
  };
}

export interface StatsParams {
  user: UserInput;
}

export class StatsConnector extends BaseConnector<StatsResponse, StatsParams> {
  query = gql`
    query stats($user: UserInput) {
      ratings(settings: { user: $user }) {
        ratings {
          rating
          rateYourMusicAlbum {
            title
            artistName
          }
        }
      }
    }
  `;
}

// Ratings
export interface RatingsResponse {
  ratings: {
    ratings: {
      rating: number;
      rateYourMusicAlbum: MirrorballRateYourMusicAlbum;
    }[];
    pageInfo: MirrorballPageInfo;
  };
}

export interface RatingsParams {
  user: UserInput;
  pageInput: { limit: number; offset: number };
  rating?: number;
}

export class RatingsConnector extends BaseConnector<
  RatingsResponse,
  RatingsParams
> {
  query = gql`
    query stats($user: UserInput, $pageInput: PageInput, $rating: Int) {
      ratings(
        settings: { user: $user, pageInput: $pageInput, rating: $rating }
      ) {
        ratings {
          rating
          rateYourMusicAlbum {
            title
            artistName
          }
        }
        pageInfo {
          recordCount
        }
      }
    }
  `;
}
