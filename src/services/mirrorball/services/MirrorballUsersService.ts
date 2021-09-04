import { gql } from "@apollo/client/core";
import { BaseService } from "../../BaseService";
import { MirrorballService } from "../MirrorballService";
import {
  MirrorballPrivacy,
  MirrorballUser,
  UserInput,
} from "../MirrorballTypes";

export const PrivateUserDisplay = "Private user";

export class MirrorballUsersService extends BaseService {
  private mirrorballService = new MirrorballService(this.logger);

  async getMirrorballUser(
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
      }>(query, { inputs });
      return response.users;
    } catch {}

    return undefined;
  }

  async updatePrivacy(discordID: string, privacy: MirrorballPrivacy) {
    const mutation = gql`
      mutation updatePrivacy($discordID: String!, $privacy: Privacy!) {
        updatePrivacy(user: { discordID: $discordID }, privacy: $privacy)
      }
    `;

    await this.mirrorballService.mutate(mutation, {
      discordID,
      privacy: privacy.toUpperCase(),
    });
  }
}
