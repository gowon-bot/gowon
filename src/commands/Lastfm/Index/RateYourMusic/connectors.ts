import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  AlbumInput,
  ArtistInput,
  IndexerRateYourMusicAlbum,
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
  ratings: [{ rating: number; rateYourMusicAlbum: IndexerRateYourMusicAlbum }];
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
        rating
        rateYourMusicAlbum {
          title
          artistName
        }
      }
    }
  `;
}

// ArtistRatings
export interface ArtistRatingsResponse {
  ratings: { rating: number; rateYourMusicAlbum: IndexerRateYourMusicAlbum }[];
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
        rating
        rateYourMusicAlbum {
          title
          artistName
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
  ratings: { rating: number; rateYourMusicAlbum: IndexerRateYourMusicAlbum }[];
}

export interface StatsParams {
  user: UserInput;
}

export class StatsConnector extends BaseConnector<StatsResponse, StatsParams> {
  query = gql`
    query stats($user: UserInput) {
      ratings(settings: { user: $user }) {
        rating
        rateYourMusicAlbum {
          title
          artistName
        }
      }
    }
  `;
}
