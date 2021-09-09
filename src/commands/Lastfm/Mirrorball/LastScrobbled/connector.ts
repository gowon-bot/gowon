import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  MirrorballTrack,
  TrackInput,
  UserInput,
} from "../../../../services/mirrorball/MirrorballTypes";

// LastScrobbledArtist
export interface LastScrobbledResponse {
  plays: {
    plays: [
      {
        scrobbledAt: number;
        track: MirrorballTrack;
      }
    ];
  };
}

export interface LastScrobbledParams {
  user: UserInput;
  track: TrackInput;
  sort: `scrobbled_at ${"desc" | "asc"}`;
}

export class LastScrobbledConnector extends BaseConnector<
  LastScrobbledResponse,
  LastScrobbledParams
> {
  query = gql`
    query lastScrobbled(
      $user: UserInput!
      $track: TrackInput!
      $sort: String!
    ) {
      plays(
        playsInput: { user: $user, track: $track, sort: $sort }
        pageInput: { limit: 1 }
      ) {
        plays {
          scrobbledAt

          track {
            artist {
              name
            }

            album {
              name
            }

            name
          }
        }
      }
    }
  `;
}
