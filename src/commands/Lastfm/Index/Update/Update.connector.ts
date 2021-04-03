import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  TaskStartResponse,
  UserInput,
} from "../../../../services/indexing/IndexingTypes";

export interface UpdateUserResponse {
  update: TaskStartResponse;
}

export interface UpdateUserParams {
  user: UserInput;
}

export class UpdateUserConnector extends BaseConnector<
  UpdateUserResponse,
  UpdateUserParams
> {
  query = gql`
    mutation updateUser($user: UserInput!) {
      update(user: $user, forceUserCreate: true) {
        ...TaskStartResponseFields
      }
    }

    ${this.fragments.taskStartResponse}
  `;
}
