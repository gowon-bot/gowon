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

  private async makeRequest(
    { query, mutation }: { query?: DocumentNode; mutation?: DocumentNode },
    variables?: object
  ): Promise<any> {
    const stringifiedVariables = JSON.stringify(variables, undefined, 2);

    this.log(
      `Sending request to ${this.baseURL} with variables ${
        stringifiedVariables.length > 500
          ? stringifiedVariables.slice(0, 1000) + "..."
          : stringifiedVariables
      }`
    );

    return query
      ? await mirrorballClient.query({
          query,
          variables,
          fetchPolicy: "no-cache",
        })
      : mutation
      ? await mirrorballClient.mutate({
          mutation,
          variables,
          fetchPolicy: "no-cache",
        })
      : undefined;
  }

  public webhook = IndexingWebhookService.getInstance();

  async query<T = any>(
    query: DocumentNode,
    variables?: { [key: string]: any }
  ): Promise<T> {
    const response = await this.makeRequest({ query }, variables);

    if (response.error) {
      throw response.error || response.errors;
    }

    return response.data;
  }

  async mutate<T = any>(
    mutation: DocumentNode,
    variables?: { [key: string]: any }
  ): Promise<T> {
    const response = await this.makeRequest({ mutation }, variables);

    if (response.error) {
      throw response.error || response.errors;
    }

    return response.data;
  }

  public async ping(): Promise<{ ping: string }> {
    return await this.query(
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
    return await this.query(
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
    return await this.query(
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
      await this.query(
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
      await this.query(
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

    const response = await this.query<{
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

    return response.data?.plays?.pageInfo?.recordCount || 0;
  }

  public async updateAndWait(discordID: string, timeout = 2000): Promise<void> {
    const query = gql`
      mutation update($user: UserInput!) {
        update(user: $user) {
          token
        }
      }
    `;

    const response = (await this.query(query, {
      user: { discordID },
    })) as {
      update: { token: string };
    };

    return await this.webhook
      .waitForResponse(response.update.token, timeout)
      .catch(() => {});
  }
}
