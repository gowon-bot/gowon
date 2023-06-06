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
