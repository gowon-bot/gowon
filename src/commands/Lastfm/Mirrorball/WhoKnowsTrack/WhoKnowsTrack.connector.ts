import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  TrackInput,
  WhoKnowsSettings,
} from "../../../../services/indexing/IndexingTypes";

export interface WhoKnowsTrackResponse {
  whoKnowsTrack: {
    track: {
      name: string;
      artist: string;
      albums: {
        name: string;
      }[];
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

export interface WhoKnowsTrackParams {
  track: TrackInput;
  settings?: WhoKnowsSettings;
}

export class WhoKnowsTrackConnector extends BaseConnector<
  WhoKnowsTrackResponse,
  WhoKnowsTrackParams
> {
  query = gql`
    query whoKnowsTrack($track: TrackInput!, $settings: WhoKnowsSettings) {
      whoKnowsTrack(track: $track, settings: $settings) {
        track {
          name
          artist
          albums {
            name
          }
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
