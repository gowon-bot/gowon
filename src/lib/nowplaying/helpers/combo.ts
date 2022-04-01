import gql from "graphql-tag";
import {
  RecentTrack,
  RecentTracks,
} from "../../../services/LastFM/converters/RecentTracks";
import { PlaysParams } from "../../../services/mirrorball/MirrorballTypes";
import { MirrorballUsersService } from "../../../services/mirrorball/services/MirrorballUsersService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { Combo, ComboCalculator } from "../../calculators/ComboCalculator";
import { GowonContext } from "../../context/Context";
import { mirrorballClient } from "../../indexing/client";
import {
  MirrorballQueryFunction,
  MirrorballPaginator,
} from "../../paginators/MirrorballPaginator";

export async function getCombo(
  ctx: GowonContext,
  queryFunc: MirrorballQueryFunction<any, any>,
  values: any
): Promise<Combo> {
  const mirrorballUsersService = ServiceRegistry.get(MirrorballUsersService);

  await mirrorballUsersService.updateAndWait(
    values,
    values.dbUser.discordID,
    5000
  );

  const paginator = new MirrorballPaginator(
    queryFunc,
    1000,
    10,
    {
      playsInput: {
        user: { discordID: values.dbUser.discordID },
        sort: "scrobbled_at desc",
      },
    },
    ctx
  );

  const comboCalculator = new ComboCalculator(ctx, []);

  return await comboCalculator.calculate(paginator);
}

export function playsQuery(
  nowPlaying: RecentTrack
): MirrorballQueryFunction<PlaysParams, RecentTracks> {
  return async (_ctx: GowonContext, variables: PlaysParams) => {
    const query = gql`
      query plays($playsInput: PlaysInput!, $pageInput: PageInput) {
        plays(playsInput: $playsInput, pageInput: $pageInput) {
          plays {
            scrobbledAt

            track {
              name
              artist {
                name
              }
              album {
                name
              }
            }
          }

          pageInfo {
            recordCount
          }
        }
      }
    `;

    const response = await mirrorballClient.query({ query, variables });

    const recentTracks = RecentTracks.fromMirrorballPlaysResponse(
      response.data,
      1000
    );

    if (variables.pageInput?.offset === 0) {
      recentTracks.tracks = [nowPlaying, ...recentTracks.tracks];
    }

    return recentTracks;
  };
}
