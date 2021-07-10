import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  MirrorballAmbiguousTrack,
  TrackInput,
  UserInput,
} from "../../../../services/mirrorball/MirrorballTypes";

export interface TrackTopAlbumsResponse {
  trackTopAlbums: {
    track: MirrorballAmbiguousTrack;

    topAlbums: {
      playcount: number;
      track: { album: { name: string } };
    }[];
  };
}

export interface TrackTopAlbumsParams {
  track: TrackInput;
  user: UserInput;
}

export class TrackTopAlbumsConnector extends BaseConnector<
  TrackTopAlbumsResponse,
  TrackTopAlbumsParams
> {
  query = gql`
    query trackTopAlbums($track: TrackInput!, $user: UserInput!) {
      trackTopAlbums(track: $track, user: $user) {
        track {
          name
          artist
        }

        topAlbums {
          playcount
          track {
            album {
              name
            }
          }
        }
      }
    }
  `;
}
