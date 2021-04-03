import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  ArtistInput,
  UserInput,
} from "../../../../services/indexing/IndexingTypes";

export interface ArtistTopTracksResponse {
  artistTopTracks: {
    artist: {
      name: string;
    };

    topTracks: {
      playcount: number;
      name: string;
    }[];
  };
}

export interface ArtistTopTracksParams {
  artist: ArtistInput;
  user: UserInput;
}

export class ArtistTopTracksConnector extends BaseConnector<
  ArtistTopTracksResponse,
  ArtistTopTracksParams
> {
  query = gql`
    query artistTopTracks($artist: ArtistInput!, $user: UserInput!) {
      artistTopTracks(artist: $artist, user: $user) {
        artist {
          name
        }

        topTracks {
          playcount
          name
        }
      }
    }
  `;
}
