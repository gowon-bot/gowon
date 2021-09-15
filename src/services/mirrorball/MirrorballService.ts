import { gql } from "@apollo/client/core";
import { DocumentNode } from "graphql";
import { IndexingWebhookService } from "../../api/indexing/IndexingWebhookService";
import { SimpleMap } from "../../helpers/types";
import { mirrorballClient } from "../../lib/indexing/client";
import { BaseService, BaseServiceContext } from "../BaseService";
import { UsersService } from "../dbservices/UsersService";
import { ServiceRegistry } from "../ServicesRegistry";
import { MirrorballPageInfo, MirrorballUserType } from "./MirrorballTypes";

export class MirrorballService extends BaseService {
  private get usersService() {
    return ServiceRegistry.get(UsersService);
  }

  private readonly baseURL = "http://localhost:8080/graphql";

  private async makeRequest(
    ctx: BaseServiceContext,
    { query, mutation }: { query?: DocumentNode; mutation?: DocumentNode },
    variables?: object
  ): Promise<any> {
    const stringifiedVariables = JSON.stringify(variables, undefined, 2);

    this.log(
      ctx,
      `Sending request to ${this.baseURL} with variables ${
        stringifiedVariables.length > 500
          ? stringifiedVariables.slice(0, 1000) + "..."
          : stringifiedVariables
      }`
    );

    try {
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
    } catch (e) {
      const operationName = (
        (query?.definitions[0] || mutation?.definitions[0]) as any
      ).name.value;

      // It's often hard to tell which operation network errors are occurring on
      // when multiple queries/mutations are run in a single command
      e.message = operationName + ": " + e.message;

      throw e;
    }
  }

  public webhook = IndexingWebhookService.getInstance();

  async query<T = any>(
    ctx: BaseServiceContext,
    query: DocumentNode,
    variables?: SimpleMap
  ): Promise<T> {
    const response = await this.makeRequest(ctx, { query }, variables);

    if (response.error) {
      throw response.errors || response.error;
    }

    return response.data;
  }

  async mutate<T = any>(
    ctx: BaseServiceContext,
    mutation: DocumentNode,
    variables?: SimpleMap
  ): Promise<T> {
    const response = await this.makeRequest(ctx, { mutation }, variables);

    if (response.error) {
      throw response.errors || response.error;
    }

    return response.data;
  }

  public async ping(ctx: BaseServiceContext): Promise<{ ping: string }> {
    return await this.query(
      ctx,
      gql`
        query {
          ping
        }
      `,
      {}
    );
  }

  public async login(
    ctx: BaseServiceContext,
    username: string,
    userType: MirrorballUserType,
    session: string | undefined
  ) {
    const discordID = this.author(ctx).id;

    return await this.query(
      ctx,
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

  public async logout(ctx: BaseServiceContext) {
    const discordID = this.author(ctx).id;

    return await this.query(
      ctx,
      gql`
        mutation logout($discordID: String!) {
          logout(discordID: $discordID)
        }
      `,
      { discordID }
    );
  }

  public async quietAddUserToGuild(
    ctx: BaseServiceContext,
    discordID: string,
    guildID: string
  ): Promise<Error | undefined> {
    try {
      await this.query(
        ctx,
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
    ctx: BaseServiceContext,
    discordID: string,
    guildID: string
  ): Promise<Error | undefined> {
    try {
      await this.query(
        ctx,
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

  public async fullIndex(ctx: BaseServiceContext) {
    const discordID = this.author(ctx).id;

    await this.usersService.setAsIndexed(ctx, discordID);

    const response = await this.query<{
      fullIndex: { token: string };
    }>(
      ctx,
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

  public async getCachedPlaycount(
    ctx: BaseServiceContext,
    discordID: string
  ): Promise<number> {
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

    const response = await this.query<{
      plays: { pageInfo: MirrorballPageInfo };
    }>(ctx, query, { discordID });

    return response?.plays?.pageInfo?.recordCount || 0;
  }

  public async updateAndWait(
    ctx: BaseServiceContext,
    discordID: string,
    timeout = 2000
  ): Promise<void> {
    const query = gql`
      mutation update($user: UserInput!) {
        update(user: $user) {
          token
        }
      }
    `;

    const response = await this.query<{
      update: { token: string };
    }>(ctx, query, {
      user: { discordID },
    });

    return await this.webhook
      .waitForResponse(response.update.token, timeout)
      .catch(() => {});
  }
}
