import { ILike } from "typeorm";
import { User } from "../../database/entity/User";
import { AlbumCard } from "../../database/entity/cards/AlbumCard";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";

export class CardsService extends BaseService {
  async getCard(
    ctx: GowonContext,
    artist: string,
    album: string
  ): Promise<AlbumCard | undefined> {
    this.log(ctx, `Getting card for ${album} by ${artist}`);

    return (
      (await AlbumCard.findOneBy({
        artist: ILike(artist),
        album: ILike(album),
      })) ?? undefined
    );
  }

  async inventory(user: User, artist?: string): Promise<AlbumCard[]> {
    return await AlbumCard.find({
      where: artist
        ? { owner: { id: user.id }, artist: ILike(artist) }
        : { owner: { id: user.id } },
      order: {
        artist: "ASC",
        album: "ASC",
      },
    });
  }
}
