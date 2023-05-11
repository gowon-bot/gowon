import { gql } from "@apollo/client/core";
import { GowonContext } from "../../../lib/context/Context";
import { BaseService } from "../../BaseService";
import { ServiceRegistry } from "../../ServicesRegistry";
import { MirrorballService } from "../MirrorballService";
import { MirrorballPageInfo } from "../MirrorballTypes";

export const PrivateUserDisplay = "Private user";

export class MirrorballUsersService extends BaseService {
  private get mirrorballService() {
    return ServiceRegistry.get(MirrorballService);
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
}
