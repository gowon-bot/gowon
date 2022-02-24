import {
  RawSpotifyItemCollection,
  SpotifyEntityName,
} from "../SpotifyService.types";
import { BaseSpotifyConverter, SpotifyEntityConverter } from "./BaseConverter";

export class SpotifyItemCollection<
  TName extends SpotifyEntityName,
  T extends SpotifyEntityConverter<TName>
> extends BaseSpotifyConverter {
  items: T[];
  href: string;
  total: number;

  constructor(
    searchResponse: RawSpotifyItemCollection<any>,
    itemClass: { new (i: any): T }
  ) {
    super();

    this.items = searchResponse.items.map((i) => new itemClass(i));
    this.href = searchResponse.href;
    this.total = searchResponse.total;
  }
}
