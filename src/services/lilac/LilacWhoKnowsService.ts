import { gql } from "@apollo/client";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";
import {
  LilacAlbum,
  LilacAlbumInput,
  LilacAmbiguousTrack,
  LilacArtist,
  LilacArtistInput,
  LilacTrackInput,
  LilacUserInput,
  LilacWhoFirstArtistRank,
  LilacWhoFirstInput,
  LilacWhoFirstRow,
  LilacWhoKnowsAlbumRank,
  LilacWhoKnowsArtistRank,
  LilacWhoKnowsInput,
  LilacWhoKnowsRow,
  LilacWhoKnowsTrackRank,
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
        user: { discordID: discordID },
      },
      false
    );
  }

  public async whoKnowsAlbum(
    ctx: GowonContext,
    artist: string,
    album: string,
    discordID: string,
    guildID?: string,
    limit = 15
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
        user: { discordID: discordID },
      }
    );
  }

  public async whoKnowsTrack(
    ctx: GowonContext,
    artist: string,
    track: string,
    discordID: string,
    guildID?: string,
    limit = 15
  ) {
    return await this.query<
      {
        whoKnowsTrack: { track: LilacAmbiguousTrack; rows: LilacWhoKnowsRow[] };
        whoKnowsTrackRank: LilacWhoKnowsTrackRank;
      },
      {
        track: LilacTrackInput;
        settings: LilacWhoKnowsInput;
        user: LilacUserInput;
      }
    >(
      ctx,
      gql`
        query whoKnowsTrack(
          $track: TrackInput!
          $settings: WhoKnowsInput!
          $user: UserInput!
        ) {
          whoKnowsTrack(track: $track, settings: $settings) {
            track {
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
              }
            }
          }

          whoKnowsTrackRank(track: $track, settings: $settings, user: $user) {
            rank
            playcount
            totalListeners
          }
        }
      `,
      {
        track: { name: track, artist: { name: artist } },
        settings: { guildID, limit },
        user: { discordID: discordID },
      }
    );
  }

  public async whoFirstArtist(
    ctx: GowonContext,
    artist: string,
    discordID: string,
    guildID?: string,
    limit = 15,
    reverse = false
  ) {
    return await this.query<
      {
        whoFirstArtist: { artist: LilacArtist; rows: LilacWhoFirstRow[] };
        whoFirstArtistRank: LilacWhoFirstArtistRank;
      },
      {
        artist: LilacArtistInput;
        settings: LilacWhoFirstInput;
        user: LilacUserInput;
      }
    >(
      ctx,
      gql`
        query whoFirstArtist(
          $artist: ArtistInput!
          $settings: WhoFirstInput!
          $user: UserInput!
        ) {
          whoFirstArtist(artist: $artist, settings: $settings) {
            artist {
              name
            }

            rows {
              firstScrobbled
              lastScrobbled
              user {
                username
                discordID
                privacy
              }
            }
          }

          whoFirstArtistRank(
            artist: $artist
            settings: $settings
            user: $user
          ) {
            rank
            totalListeners
            firstScrobbled
            lastScrobbled
          }
        }
      `,
      {
        artist: { name: artist },
        settings: { guildID, limit, reverse },
        user: { discordID: discordID },
      }
    );
  }
}
