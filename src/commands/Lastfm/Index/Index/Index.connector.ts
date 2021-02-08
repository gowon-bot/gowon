import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";

export interface IndexUserResponse {
  indexUser: {
    token: string;
  };
}

export interface IndexUserParams {
  username: string;
}

export class IndexUserConnector extends BaseConnector<
  IndexUserResponse,
  IndexUserParams
> {
  query = gql`
    mutation indexUser($username: String!) {
      indexUser(username: $username) {
        token
      }
    }
  `;
}
