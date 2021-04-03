import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  TaskStartResponse,
  UserInput,
} from "../../../../services/indexing/IndexingTypes";

export interface IndexUserResponse {
  fullIndex: TaskStartResponse;
}

export interface IndexUserParams {
  user: UserInput;
  guildID: string;
  discordID: string;
}

export class IndexUserConnector extends BaseConnector<
  IndexUserResponse,
  IndexUserParams
> {
  query = gql`
    mutation fullIndex(
      $user: UserInput!
      $guildID: String!
      $discordID: String!
    ) {
      fullIndex(user: $user, forceUserCreate: true) {
        ...TaskStartResponseFields
      }

      addUserToGuild(discordID: $discordID, guildID: $guildID) {
        user {
          id
        }
        guildID
      }
    }

    ${this.fragments.taskStartResponse}
  `;
}
