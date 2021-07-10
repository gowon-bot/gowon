import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  ArtistInput,
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
}

export interface WhoKnowsArtistParams {
  artist: ArtistInput;
  settings?: WhoKnowsSettings;
}

export class WhoKnowsArtistConnector extends BaseConnector<
  WhoKnowsArtistResponse,
  WhoKnowsArtistParams
> {
  query = gql`
    query whoKnowsArtist($artist: ArtistInput!, $settings: WhoKnowsSettings) {
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
    }
  `;
}
