import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  ArtistInput,
  WhoKnowsSettings,
} from "../../../../services/indexing/IndexingTypes";

// WhoFirstArtist
export interface WhoFirstArtistResponse {
  whoFirstArtist: {
    artist: {
      name: string;
    };
    rows: {
      user: {
        username: string;
        discordID: string;
      };
      scrobbledAt: number;
    }[];
  };
}

export interface WhoFirstArtistParams {
  artist: ArtistInput;
  settings?: WhoKnowsSettings;
  whoLast?: boolean;
}

export class WhoFirstArtistConnector extends BaseConnector<
  WhoFirstArtistResponse,
  WhoFirstArtistParams
> {
  query = gql`
    query whoFirstArtist(
      $artist: ArtistInput!
      $settings: WhoKnowsSettings
      $whoLast: Boolean
    ) {
      whoFirstArtist(artist: $artist, settings: $settings, whoLast: $whoLast) {
        artist {
          name
        }

        rows {
          user {
            username
            discordID
          }
          scrobbledAt
        }
      }
    }
  `;
}
