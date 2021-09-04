import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../../lib/indexing/BaseConnector";
import {
  AlbumInput,
  MirrorballUser,
  WhoKnowsSettings,
} from "../../../../../services/mirrorball/MirrorballTypes";

export interface WhoKnowsAlbumResponse {
  whoKnowsAlbum: {
    album: {
      name: string;
      artist: {
        name: string;
      };
    };

    rows: {
      playcount: number;
      user: MirrorballUser;
    }[];
  };
}

export interface WhoKnowsAlbumParams {
  album: AlbumInput;
  settings?: WhoKnowsSettings;
}

export class WhoKnowsAlbumConnector extends BaseConnector<
  WhoKnowsAlbumResponse,
  WhoKnowsAlbumParams
> {
  query = gql`
    query whoKnowsAlbum($album: AlbumInput!, $settings: WhoKnowsSettings) {
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
    }
  `;
}
