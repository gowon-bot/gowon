import { gql } from "@apollo/client/core";
import { BaseService, BaseServiceContext } from "../../BaseService";
import { ServiceRegistry } from "../../ServicesRegistry";
import { MirrorballService } from "../MirrorballService";
import {
  MirrorballPrivacy,
  MirrorballUser,
  UserInput,
} from "../MirrorballTypes";

export const PrivateUserDisplay = "Private user";

export class MirrorballUsersService extends BaseService {
  private get mirrorballService() {
    return ServiceRegistry.get(MirrorballService);
  }

  async getMirrorballUser(
    ctx: BaseServiceContext,
    inputs: UserInput[]
  ): Promise<MirrorballUser[] | undefined> {
    const query = gql`
      query getUser($inputs: [UserInput!]!) {
        users(inputs: $inputs) {
          id
          username
          discordID

          userType
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

  async updatePrivacy(
    ctx: BaseServiceContext,
    discordID: string,
    privacy: MirrorballPrivacy
  ) {
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
}
