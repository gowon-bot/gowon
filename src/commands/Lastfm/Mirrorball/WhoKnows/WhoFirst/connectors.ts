import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../../lib/indexing/BaseConnector";
import {
  ArtistInput,
  MirrorballUser,
  WhoKnowsSettings,
} from "../../../../../services/mirrorball/MirrorballTypes";

// WhoFirstArtist
export interface WhoFirstArtistResponse {
  whoFirstArtist: {
    artist: {
      name: string;
    };
    rows: {
      user: MirrorballUser;
      scrobbledAt: number;
    }[];

    undated: {
      user: { discordID: string };
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
            privacy
          }
          scrobbledAt
        }

        undated {
          user {
            discordID
          }
        }
      }
    }
  `;
}
