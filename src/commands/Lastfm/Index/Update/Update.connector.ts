import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";

export interface UpdateUserResponse {
  updateUser: {
    token: string;
  };
}

export interface UpdateUserParams {
  username: string;
}

export class UpdateUserConnector extends BaseConnector<
  UpdateUserResponse,
  UpdateUserParams
> {
  query = gql`
    mutation updateUser($username: String!) {
      updateUser(username: $username) {
        token
      }
    }
  `;
}
