import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  AlbumInput,
  MirrorballAlbum,
  UserInput,
} from "../../../../services/indexing/IndexingTypes";

export interface AlbumTopTracksResponse {
  albumTopTracks: {
    album: MirrorballAlbum;

    topTracks: {
      playcount: number;
      name: string;
    }[];
  };
}

export interface AlbumTopTracksParams {
  album: AlbumInput;
  user: UserInput;
}

export class AlbumTopTracksConnector extends BaseConnector<
  AlbumTopTracksResponse,
  AlbumTopTracksParams
> {
  query = gql`
    query albumTopTracks($album: AlbumInput!, $user: UserInput!) {
      albumTopTracks(album: $album, user: $user) {
        album {
          name
          artist {
            name
          }
        }

        topTracks {
          playcount
          name
        }
      }
    }
  `;
}
