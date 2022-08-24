import { gql } from "@apollo/client";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";
import {
  LilacArtist,
  LilacArtistInput,
  LilacWhoKnowsInput,
  LilacWhoKnowsRow,
} from "./LilacAPIService.types";

export class LilacWhoKnowsService extends LilacAPIService {
  public async whoKnowsArtist(
    ctx: GowonContext,
    artist: string,
    guildID?: string
  ) {
    return await this.query<
      {
        whoKnowsArtist: { artist: LilacArtist; rows: LilacWhoKnowsRow[] };
      },
      {
        artist: LilacArtistInput;
        settings: LilacWhoKnowsInput;
      }
    >(
      ctx,
      gql`
        query whoKnowsArtist($artist: ArtistInput!, $settings: WhoKnowsInput!) {
          whoKnowsArtist(artist: $artist, settings: $settings) {
            artist {
              name
            }

            rows {
              playcount
              user {
                username
                discordID
                privacy
                lastIndexed
              }
            }
          }
        }
      `,
      { artist: { name: artist }, settings: { guildID } }
    );
  }

  public generateWhoKnowsArtistRank(
    whoKnowsRows: LilacWhoKnowsRow[],
    discordID: string
  ): { rank: number; playcount: number } {
    const idx = whoKnowsRows.findIndex((r) => r.user.discordID === discordID);

    if (idx === -1) return { rank: 0, playcount: 0 };

    return {
      rank: idx + 1,
      playcount: whoKnowsRows[idx].playcount,
    };
  }
}
