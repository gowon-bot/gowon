import { gql } from "@apollo/client/core";
import { DocumentNode } from "graphql";
import { IndexingWebhookService } from "../../api/indexing/IndexingWebhookService";
import { mirrorballClient } from "../../lib/indexing/client";
import { BaseService } from "../BaseService";
import { UsersService } from "../dbservices/UsersService";
import { MirrorballPageInfo, UserType } from "./MirrorballTypes";

export class MirrorballService extends BaseService {
  private usersService = new UsersService(this.logger);

  private readonly baseURL = "http://localhost:8080/graphql";

  private async sendRequest(
    query: DocumentNode,
    variables?: object
  ): Promise<any> {
    this.log(
      `Sending request to ${this.baseURL} with variables ${JSON.stringify(
        variables,
        undefined,
        2
      )}`
    );

    return await mirrorballClient.query({
      query,
      variables,
      fetchPolicy: "no-cache",
    });
  }

  public webhook = IndexingWebhookService.getInstance();

  async genericRequest<T = any>(
    query: DocumentNode,
    variables: { [key: string]: any }
  ): Promise<T> {
    return (await this.sendRequest(query, variables)).data;
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

  public async login(
    username: string,
    discordID: string,
    userType: UserType,
    session: string | undefined
  ) {
    return await this.genericRequest(
      gql`
        mutation login(
          $username: String!
          $discordID: String!
          $userType: UserType!
          $session: String
        ) {
          login(
            username: $username
            discordID: $discordID
            userType: $userType
            session: $session
          ) {
            id
          }
        }
      `,
      { username, discordID, userType, session }
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

  public async getCachedPlaycount(discordID: string): Promise<number> {
    const query = gql`
      query cachedPlaycount($discordID: String!) {
        plays(
          playsInput: { user: { discordID: $discordID } }
          pageInput: { limit: 1 }
        ) {
          pageInfo {
            recordCount
          }
        }
      }
    `;

    const response = await mirrorballClient.query<{
      plays: { pageInfo: MirrorballPageInfo };
    }>({
      query,
      variables: { discordID },
    });

    console.log(response);

    return response.data?.plays?.pageInfo?.recordCount || 0;
  }
}
