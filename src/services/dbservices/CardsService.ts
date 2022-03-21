import { Chance } from "chance";
import { ILike } from "typeorm";
import { AlbumCard } from "../../database/entity/AlbumCard";
import { User } from "../../database/entity/User";
import { asyncFind } from "../../helpers";
import { RedirectsCache } from "../../lib/caches/RedirectsCache";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { TopAlbum } from "../LastFM/converters/TopTypes";
import { Requestable } from "../LastFM/LastFMAPIService";
import { LastFMService } from "../LastFM/LastFMService";
import { ServiceRegistry } from "../ServicesRegistry";

export class CardsService extends BaseService {
  private get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }

  generateAlbumToMint(mintableAlbums: TopAlbum[]): TopAlbum {
    const mostPlaycount = mintableAlbums.sort(
      (a, b) => a.userPlaycount - b.userPlaycount
    )[0].userPlaycount;

    return Chance().weighted(
      mintableAlbums,
      mintableAlbums.map((a) => a.userPlaycount / mostPlaycount)
    );
  }

  async mint(
    ctx: GowonContext,
    album: TopAlbum,
    user: User
  ): Promise<AlbumCard> {
    this.log(
      ctx,
      `Minting new card: ${album.name} by ${album.artist.name} to ${user.lastFMUsername}`
    );

    const card = AlbumCard.create({
      artist: album.artist.name,
      album: album.name,
      owner: user,
      firstOwner: user,
      playcount: album.userPlaycount,
    });

    await card.save();

    return card;
  }

  async getCard(
    ctx: GowonContext,
    artist: string,
    album: string
  ): Promise<AlbumCard | undefined> {
    this.log(ctx, `Getting card for ${album} by ${artist}`);

    return AlbumCard.findOne({ artist: ILike(artist), album: ILike(album) });
  }

  async getMintableCards(
    ctx: GowonContext,
    user: User,
    requestable: Requestable,
    page = 1
  ): Promise<TopAlbum[]> {
    const [albums, albumCards] = await Promise.all([
      this.lastFMService.topAlbums(ctx, {
        page,
        limit: 250,
        username: requestable,
      }),
      await this.inventory(user),
    ]);

    const filtered = await this.filterAlbumCards(
      ctx,
      albums.albums,
      albumCards
    );

    if (!filtered.length && albums.meta.page <= albums.meta.totalPages) {
      return this.getMintableCards(ctx, user, requestable, page + 1);
    }

    return filtered;
  }

  async inventory(user: User): Promise<AlbumCard[]> {
    return await AlbumCard.find({ owner: user });
  }

  private async filterAlbumCards(
    ctx: GowonContext,
    albums: TopAlbum[],
    albumCards: AlbumCard[]
  ) {
    const redirectsCache = new RedirectsCache(ctx);

    await redirectsCache.initialCache(ctx, [
      ...albums.map((a) => a.artist.name),
      ...albumCards.map((l) => l.artist),
    ]);

    const filtered = [] as TopAlbum[];

    for (const album of albums) {
      const albumCard = await asyncFind(albumCards, async (lc) => {
        if (album.name !== lc.album) return false;

        const redirects = await Promise.all([
          redirectsCache.getRedirect(album.artist.name),
          redirectsCache.getRedirect(lc.artist),
        ]);

        if (redirects[0] !== redirects[1]) return false;
        return true;
      });

      if (!albumCard) filtered.push(album);
    }

    return filtered;
  }
}
