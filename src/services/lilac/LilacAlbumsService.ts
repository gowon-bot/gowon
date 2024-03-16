import { gql } from "apollo-server-express";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";
import { LilacAlbumFilters, LilacAlbumsPage } from "./LilacAPIService.types";

type SimpleLilacAlbum = {
  artist: string;
  name: string;
};

export class LilacAlbumsService extends LilacAPIService {
  async list(
    ctx: GowonContext,
    filters: LilacAlbumFilters
  ): Promise<LilacAlbumsPage> {
    const query = gql`
      query list($filters: AlbumsFilters!) {
        albums(filters: $filters) {
          albums {
            id
            name

            artist {
              name
            }
          }

          pagination {
            totalItems
            currentPage
            totalPages
            perPage
          }
        }
      }
    `;

    const response = await this.query<
      { albums: LilacAlbumsPage },
      { filters: LilacAlbumFilters }
    >(ctx, query, { filters }, false);

    return response.albums;
  }

  async correctAlbumName(
    ctx: GowonContext,
    album: SimpleLilacAlbum
  ): Promise<SimpleLilacAlbum> {
    this.log(ctx, `Correcting album name for ${album.artist} - ${album.name}`);

    const albumInput = {
      name: album.name,
      artist: { name: album.artist },
    };

    const response = await this.list(ctx, { album: albumInput });

    return response.albums.length > 0
      ? {
          artist: response.albums[0].artist.name,
          name: response.albums[0].name,
        }
      : album;
  }
}
