import { gql } from "apollo-server-core";
import { DocumentNode } from "graphql";
import request from "graphql-request";
import { RequestDocument } from "graphql-request/dist/types";
import { IndexingWebhookService } from "../../api/indexing/IndexingWebhookService";
import { BaseService } from "../BaseService";
import { UserType } from "./IndexingTypes";

export class IndexingService extends BaseService {
  private readonly baseURL = "http://localhost:8080/graphql";

  private async sendRequest(
    query: RequestDocument,
    variables?: object
  ): Promise<any> {
    this.log(
      `Sending request to ${this.baseURL} with variables ${JSON.stringify(
        variables,
        undefined,
        2
      )}`
    );

    return await (variables
      ? request(this.baseURL, query, variables)
      : request(this.baseURL, query));
  }

  public webhook = IndexingWebhookService.getInstance();

  async genericRequest<T = any>(
    query: DocumentNode,
    variables: { [key: string]: any }
  ): Promise<T> {
    return await this.sendRequest(query, variables);
  }

  public async ping(): Promise<{ ping: string }> {
    return await this.genericRequest(
      gql`
        query {
          ping
        }
      `,
      {}
    );
  }

  public async login(username: string, discordID: string, userType: UserType) {
    return await this.genericRequest(
      gql`
        mutation login(
          $username: String!
          $discordID: String!
          $userType: UserType!
        ) {
          login(
            username: $username
            discordID: $discordID
            userType: $userType
          ) {
            id
          }
        }
      `,
      { username, discordID, userType }
    );
  }

  public async logout(discordID: string) {
    return await this.genericRequest(
      gql`
        mutation logout($discordID: String!) {
          logout(discordID: $discordID)
        }
      `,
      { discordID }
    );
  }

  public async addUserToGuild(discordID: string, guildID: string) {
    await this.genericRequest(
      gql`
        mutation addUserToGuild($discordID: String!, $guildID: String!) {
          addUserToGuild(discordID: $discordID, guildID: $guildID) {
            user {
              id
            }
            guildID
          }
        }
      `,
      { discordID, guildID }
    );
  }

  public async removeUserFromGuild(discordID: string, guildID: string) {
    await this.genericRequest(
      gql`
        mutation removeUserFromGuild($discordID: String!, $guildID: String!) {
          removeUserFromGuild(discordID: $discordID, guildID: $guildID)
        }
      `,
      { discordID, guildID }
    );
  }

  public async fullIndex(discordID: string, username: string) {
    const response = await this.genericRequest<{
      fullIndex: { token: string };
    }>(
      gql`
        mutation fullIndex($discordID: String!, $username: String!) {
          fullIndex(
            user: { discordID: $discordID, lastFMUsername: $username }
            forceUserCreate: true
          ) {
            token
          }
        }
      `,
      { discordID, username }
    );

    await this.webhook.waitForResponse(response.fullIndex.token);
  }
}
