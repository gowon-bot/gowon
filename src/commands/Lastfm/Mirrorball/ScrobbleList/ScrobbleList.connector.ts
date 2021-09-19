import { gql } from "@apollo/client/core";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  MirrorballDate,
  MirrorballPageInfo,
  PageInput,
  TrackInput,
  UserInput,
} from "../../../../services/mirrorball/MirrorballTypes";

export interface ScrobbleListResponse {
  plays: {
    plays: {
      scrobbledAt: MirrorballDate;
    }[];
    pageInfo: MirrorballPageInfo;
  };
}

export interface ScrobbleListParams {
  user: UserInput;
  track: TrackInput;
  pageInput: PageInput;
}

export class ScrobbleListConnector extends BaseConnector<
  ScrobbleListResponse,
  ScrobbleListParams
> {
  query = gql`
    query scrobbleList(
      $user: UserInput!
      $track: TrackInput!
      $pageInput: PageInput!
    ) {
      plays(
        playsInput: { user: $user, track: $track, sort: "scrobbled_at desc" }
        pageInput: $pageInput
      ) {
        plays {
          scrobbledAt
        }

        pageInfo {
          recordCount
        }
      }
    }
  `;
}
