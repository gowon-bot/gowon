import { ILike } from "typeorm";
import { AlbumCard } from "../../database/entity/cards/AlbumCard";
import { User } from "../../database/entity/User";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";

export class CardsService extends BaseService {
  async getCard(
    ctx: GowonContext,
    artist: string,
    album: string
  ): Promise<AlbumCard | undefined> {
    this.log(ctx, `Getting card for ${album} by ${artist}`);

    return AlbumCard.findOne({ artist: ILike(artist), album: ILike(album) });
  }

  async inventory(user: User, artist?: string): Promise<AlbumCard[]> {
    return await AlbumCard.find({
      where: artist ? { owner: user, artist: ILike(artist) } : { owner: user },
      order: {
        artist: "ASC",
        album: "ASC",
      },
    });
  }
}
