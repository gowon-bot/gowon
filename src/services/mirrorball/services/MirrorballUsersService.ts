import { gql } from "@apollo/client/core";
import { IndexingWebhookService } from "../../../api/webhooks/IndexingWebhookService";
import { GowonContext } from "../../../lib/context/Context";
import { BaseService } from "../../BaseService";
import { UsersService } from "../../dbservices/UsersService";
import { ServiceRegistry } from "../../ServicesRegistry";
import { MirrorballService } from "../MirrorballService";
import {
  MirrorballPageInfo,
  MirrorballPrivacy,
  MirrorballUser,
  UserInput,
} from "../MirrorballTypes";

export const PrivateUserDisplay = "Private user";

export class MirrorballUsersService extends BaseService {
  private get mirrorballService() {
    return ServiceRegistry.get(MirrorballService);
  }
  private get usersService() {
    return ServiceRegistry.get(UsersService);
  }

  public webhook = IndexingWebhookService.getInstance();

  async getMirrorballUser(
    ctx: GowonContext,
    inputs: UserInput[]
  ): Promise<MirrorballUser[] | undefined> {
    const query = gql`
      query getUser($inputs: [UserInput!]!) {
        users(inputs: $inputs) {
          id
          username
          discordID

          privacy
        }
      }
    `;

    try {
      const response = await this.mirrorballService.query<{
        users: [MirrorballUser];
      }>(ctx, query, { inputs });
      return response.users;
    } catch {}

    return undefined;
  }

  async updatePrivacy(ctx: GowonContext, privacy: MirrorballPrivacy) {
    const discordID = ctx.author.id;

    const mutation = gql`
      mutation updatePrivacy($discordID: String!, $privacy: Privacy!) {
        updatePrivacy(user: { discordID: $discordID }, privacy: $privacy)
      }
    `;

    await this.mirrorballService.mutate(ctx, mutation, {
      discordID,
      privacy: privacy.toUpperCase(),
    });
  }

  public async login(
    ctx: GowonContext,
    username: string,
    session: string | undefined
  ) {
    const discordID = ctx.author.id;

    return await this.mirrorballService.query(
      ctx,
      gql`
        mutation login(
          $username: String!
          $discordID: String!
          $session: String
        ) {
          login(username: $username, discordID: $discordID, session: $session) {
            id
          }
        }
      `,
      { username, discordID, session }
    );
  }

  public async logout(ctx: GowonContext) {
    const discordID = ctx.author.id;

    return await this.mirrorballService.query(
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
    ctx: GowonContext,
    discordID: string,
    guildID: string
  ): Promise<Error | undefined> {
    try {
      await this.mirrorballService.query(
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
      if (e instanceof Error) {
        return e;
      }
    }

    return;
  }

  public async quietRemoveUserFromGuild(
    ctx: GowonContext,
    discordID: string,
    guildID: string
  ): Promise<Error | undefined> {
    try {
      await this.mirrorballService.query(
        ctx,
        gql`
          mutation removeUserFromGuild($discordID: String!, $guildID: String!) {
            removeUserFromGuild(discordID: $discordID, guildID: $guildID)
          }
        `,
        { discordID, guildID }
      );
    } catch (e) {
      if (e instanceof Error) {
        return e;
      }
    }

    return;
  }

  public async fullIndex(ctx: GowonContext) {
    const discordID = ctx.author.id;

    await this.usersService.setAsIndexed(ctx, discordID);

    const response = await this.mirrorballService.query<{
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
    ctx: GowonContext,
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

    const response = await this.mirrorballService.query<{
      plays: { pageInfo: MirrorballPageInfo };
    }>(ctx, query, { discordID });

    return response?.plays?.pageInfo?.recordCount || 0;
  }

  public async updateAndWait(
    ctx: GowonContext,
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

    const response = await this.mirrorballService.query<{
      update: { token: string };
    }>(ctx, query, {
      user: { discordID },
    });

    return await this.webhook
      .waitForResponse(response.update.token, timeout)
      .catch(() => {});
  }
}
