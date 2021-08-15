import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  ArtistInput,
  UserInput,
  WhoKnowsSettings,
} from "../../../../services/mirrorball/MirrorballTypes";

export interface WhoKnowsArtistResponse {
  whoKnowsArtist: {
    artist: {
      name: string;
    };
    rows: {
      playcount: number;
      user: {
        username: string;
        discordID: string;
      };
    }[];
  };
  artistRank: {
    playcount: number;
    rank: number;
  };
}

export interface WhoKnowsArtistParams {
  artist: ArtistInput;
  settings?: WhoKnowsSettings;
  serverID: string;
  user: UserInput;
}

export class WhoKnowsArtistConnector extends BaseConnector<
  WhoKnowsArtistResponse,
  WhoKnowsArtistParams
> {
  query = gql`
    query whoKnowsArtist(
      $artist: ArtistInput!
      $settings: WhoKnowsSettings
      $serverID: String!
      $user: UserInput!
    ) {
      whoKnowsArtist(artist: $artist, settings: $settings) {
        artist {
          name
        }

        rows {
          playcount
          user {
            username
            discordID
          }
        }
      }

      artistRank(artist: $artist, userInput: $user, serverID: $serverID) {
        rank
        playcount
      }
    }
  `;
}
