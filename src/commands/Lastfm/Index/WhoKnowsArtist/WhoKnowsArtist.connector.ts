import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";

export interface WhoKnowsArtistResponse {
  whoKnows: {
    artist: {
      name: string;
    };
    users: {
      playcount: number;
      user: {
        lastFMUsername: string;
      };
    }[];
  };
}

export interface WhoKnowsArtistParams {
  artist: string;
}

export class WhoKnowsArtistConnector extends BaseConnector<
  WhoKnowsArtistResponse,
  WhoKnowsArtistParams
> {
  query = gql`
    query whoKnowsArtist($artist: String!) {
      whoKnows(artist: $artist) {
        artist {
          name
        }
        users {
          playcount
          user {
            lastFMUsername
          }
        }
      }
    }
  `;
}
