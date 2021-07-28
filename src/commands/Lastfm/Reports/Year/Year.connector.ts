import gql from "graphql-tag";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  MirrorballPageInfo,
  MirrorballPlay,
  PlaysParams,
} from "../../../../services/mirrorball/MirrorballTypes";

export interface YearResponse {
  plays: {
    plays: MirrorballPlay[];
    pageInfo: MirrorballPageInfo;
  };
}

export type YearParams = PlaysParams;

export class YearConnector extends BaseConnector<YearResponse, YearParams> {
  query = gql`
    query year($playsInput: PlaysInput!, $pageInput: PageInput) {
      plays(playsInput: $playsInput, pageInput: $pageInput) {
        plays {
          track {
            name
            artist {
              name
            }
            album {
              name
            }
          }
        }
        pageInfo {
          recordCount
        }
      }
    }
  `;
}
