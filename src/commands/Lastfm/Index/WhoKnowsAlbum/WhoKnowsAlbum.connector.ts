import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  AlbumInput,
  WhoKnowsSettings,
} from "../../../../services/indexing/IndexingTypes";

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
      user: {
        username: string;
        discordID: string;
      };
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
          }
        }
      }
    }
  `;
}
