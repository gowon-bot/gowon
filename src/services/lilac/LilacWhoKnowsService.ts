import { gql } from "@apollo/client";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";
import {
  LilacAlbum,
  LilacAlbumInput,
  LilacArtist,
  LilacArtistInput,
  LilacUserInput,
  LilacWhoKnowsAlbumRank,
  LilacWhoKnowsArtistRank,
  LilacWhoKnowsInput,
  LilacWhoKnowsRow,
} from "./LilacAPIService.types";

export class LilacWhoKnowsService extends LilacAPIService {
  public async whoKnowsArtist(
    ctx: GowonContext,
    artist: string,
    discordID: string,
    guildID?: string,
    limit = 15
  ) {
    return await this.query<
      {
        whoKnowsArtist: { artist: LilacArtist; rows: LilacWhoKnowsRow[] };
        whoKnowsArtistRank: LilacWhoKnowsArtistRank;
      },
      {
        artist: LilacArtistInput;
        settings: LilacWhoKnowsInput;
        user: LilacUserInput;
      }
    >(
      ctx,
      gql`
        query whoKnowsArtist(
          $artist: ArtistInput!
          $settings: WhoKnowsInput!
          $user: UserInput!
        ) {
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

          whoKnowsArtistRank(
            artist: $artist
            settings: $settings
            user: $user
          ) {
            rank
            playcount
            totalListeners
          }
        }
      `,
      {
        artist: { name: artist },
        settings: { guildID, limit },
        user: { discordID },
      }
    );
  }

  public async whoKnowsAlbum(
    ctx: GowonContext,
    artist: string,
    album: string,
    discordID: string,
    guildID?: string,
    limit?: 15
  ) {
    return await this.query<
      {
        whoKnowsAlbum: { album: LilacAlbum; rows: LilacWhoKnowsRow[] };
        whoKnowsAlbumRank: LilacWhoKnowsAlbumRank;
      },
      {
        album: LilacAlbumInput;
        settings: LilacWhoKnowsInput;
        user: LilacUserInput;
      }
    >(
      ctx,
      gql`
        query whoKnowsAlbum(
          $album: AlbumInput!
          $settings: WhoKnowsInput!
          $user: UserInput!
        ) {
          whoKnowsAlbum(album: $album, settings: $settings) {
            album {
              name
              artist {
                name
              }
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

          whoKnowsAlbumRank(album: $album, settings: $settings, user: $user) {
            rank
            playcount
            totalListeners
          }
        }
      `,
      {
        album: { name: album, artist: { name: artist } },
        settings: { guildID, limit },
        user: { discordID },
      }
    );
  }
}
