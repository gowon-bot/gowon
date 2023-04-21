import { ArgumentsMap } from "../../../lib/context/arguments/types";
import {
  TopAlbum,
  TopArtist,
  TopTrack,
} from "../../../services/LastFM/converters/TopTypes";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export abstract class AroundCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseCommand<T> {
  protected getTopArgs(
    rank?: number,
    shouldSearchByRank = false
  ): { limit: number; page?: number; headWaste?: number; tailWaste?: number } {
    if (!shouldSearchByRank || !rank) return { limit: 1000 };
    if (rank <= 5) return { limit: 11, headWaste: 0, tailWaste: 5 - rank + 1 };

    const offset = Math.max(0, rank - 5);

    let limit = 11;
    let page = 1;

    for (let pageSize = limit; pageSize <= offset + limit; pageSize++) {
      for (let leftShift = 0; leftShift <= pageSize - limit; leftShift++) {
        if ((offset - leftShift) % pageSize == 0) {
          limit = pageSize;
          page = (offset - leftShift) / pageSize + 1;

          const headWaste = Math.max(leftShift - 1, 0);
          const tailWaste = (page + 1) * pageSize - (offset + limit) - 2;

          return { limit, page, headWaste, tailWaste };
        }
      }
    }

    return { limit, page: undefined };
  }

  protected getSlice<T extends (TopArtist | TopAlbum | TopTrack)[]>({
    rank,
    entityName,
    headWaste,
    tailWaste,
    entities,
  }: {
    rank?: number;
    entityName?: string;
    headWaste?: number;
    tailWaste?: number;
    entities: T;
  }): T {
    if (entityName) {
      const targetEntity = entities.find(
        (e) => e.name.toLowerCase() === entityName.toLowerCase()
      );

      const index = entities.indexOf(targetEntity!);
      entities = entities.slice(Math.max(index - 5, 0), index + 6) as T;

      return entities as T;
    }

    if (headWaste !== undefined) {
      entities = entities.slice(headWaste) as T;
    }

    if (tailWaste !== undefined) {
      entities = entities.slice(
        0,
        rank && rank <= 5 ? 11 - tailWaste : 11
      ) as T;
    }

    return entities as T;
  }
}
