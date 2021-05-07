import { gql } from "apollo-server-core";
import { DocumentNode } from "graphql";
import request from "graphql-request";
import { RequestDocument } from "graphql-request/dist/types";
import { IndexingWebhookService } from "../../api/indexing/IndexingWebhookService";
import { BaseService } from "../BaseService";
import { UsersService } from "../dbservices/UsersService";
import { UserType } from "./IndexingTypes";

export class IndexingService extends BaseService {
  private usersService = new UsersService(this.logger);

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

  public async quietAddUserToGuild(
    discordID: string,
    guildID: string
  ): Promise<Error | undefined> {
    try {
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
    } catch (e) {
      return e;
    }

    return;
  }

  public async quietRemoveUserFromGuild(
    discordID: string,
    guildID: string
  ): Promise<Error | undefined> {
    try {
      await this.genericRequest(
        gql`
          mutation removeUserFromGuild($discordID: String!, $guildID: String!) {
            removeUserFromGuild(discordID: $discordID, guildID: $guildID)
          }
        `,
        { discordID, guildID }
      );
    } catch (e) {
      return e;
    }

    return;
  }

  public async fullIndex(discordID: string) {
    await this.usersService.setAsIndexed(discordID);

    const response = await this.genericRequest<{
      fullIndex: { token: string };
    }>(
      gql`
        mutation fullIndex($discordID: String!) {
          fullIndex(user: { discordID: $discordID }, forceUserCreate: true) {
            token
          }
        }
      `,
      { discordID }
    );

    await this.webhook.waitForResponse(response.fullIndex.token);
  }
}
