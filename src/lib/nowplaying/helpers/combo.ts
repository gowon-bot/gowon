import gql from "graphql-tag";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import {
  RecentTrack,
  RecentTracks,
} from "../../../services/LastFM/converters/RecentTracks";
import { MirrorballService } from "../../../services/mirrorball/MirrorballService";
import { PlaysParams } from "../../../services/mirrorball/MirrorballTypes";
import { Combo, ComboCalculator } from "../../calculators/ComboCalculator";
import { mirrorballClient } from "../../indexing/client";
import {
  MirrorballQueryFunction,
  MirrorballPaginator,
} from "../../paginators/MirrorballPaginator";

export async function getCombo(
  queryFunc: MirrorballQueryFunction<any, any>,
  values: any
): Promise<Combo> {
  const mirrorballService = new MirrorballService(values.logger);

  await mirrorballService.updateAndWait(values.dbUser.discordID, 5000);

  const paginator = new MirrorballPaginator(queryFunc, 1000, 10, {
    playsInput: {
      user: { discordID: values.dbUser.discordID },
      sort: "scrobbled_at desc",
    },
  });

  const redirectsService = new RedirectsService(values.logger);

  const comboCalculator = new ComboCalculator(redirectsService, []);

  return await comboCalculator.calculate(paginator);
}

export function playsQuery(
  nowPlaying: RecentTrack
): (variables: PlaysParams) => Promise<RecentTracks> {
  return async (variables: PlaysParams) => {
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

    console.log(
      recentTracks.tracks
        .slice(0, 30)
        .map((t, idx) => `${idx + 1}` + ". " + t.name)
    );

    if (variables.pageInput?.offset === 0) {
      recentTracks.tracks = [nowPlaying, ...recentTracks.tracks];
    }

    return recentTracks;
  };
}
