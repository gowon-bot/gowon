import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../lib/indexing/BaseConnector";
import { UserInput } from "../../../services/mirrorball/MirrorballTypes";

// ImportRatings
export interface ImportRatingsResponse {
  importRatings: {};
}

export interface ImportRatingsParams {
  user: UserInput;
  csv: string;
}

export class ImportRatingsConnector extends BaseConnector<
  ImportRatingsResponse,
  ImportRatingsParams
> {
  query = gql`
    mutation importRatings($user: UserInput!, $csv: String!) {
      importRatings(user: $user, csv: $csv)
    }
  `;
}
