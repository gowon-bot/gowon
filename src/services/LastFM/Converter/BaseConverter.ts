import { toInt } from "../../../helpers/lastFM";
import { Tag } from "../LastFMService.types";

export abstract class BaseConverter {
  protected number(value: any): number {
    return toInt(value);
  }

  protected boolean(value: any): boolean {
    if (value === "true") return true;
    if (value === "1") return true;

    return false;
  }

  protected convertTags(tags: Tag[]): string[] {
    return tags.map((t) => t.name);
  }

  protected array<T>(value?: Array<T>): Array<T> {
    return value instanceof Array ? value : [];
  }
}
