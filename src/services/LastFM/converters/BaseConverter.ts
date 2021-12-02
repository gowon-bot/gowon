import { fromUnixTime } from "date-fns";
import { toInt } from "../../../helpers/lastFM";
import { RawTag } from "../LastFMService.types";
import { RawImage } from "../LastFMService.types";

export class ImageCollection {
  constructor(private images: RawImage[]) {}

  get(size: string): string | undefined {
    return this.images.find((i) => i.size === size)?.["#text"];
  }
}

export interface Concatonatable<T> {
  concat(type: T): void;
}

export function isConcatonatable<T>(
  value: Concatonatable<T> | T
): value is Concatonatable<T> {
  return (value as any).concat instanceof Function;
}

export abstract class BaseConverter {
  protected number(value: any): number {
    return toInt(value);
  }

  protected boolean(value: any): boolean {
    if (typeof value === "boolean") return true;
    if (value === "true") return true;
    if (value === "1") return true;

    return false;
  }

  protected convertTags(tags: RawTag[]): string[] {
    return tags.map((t) => t.name);
  }

  protected array<T>(value?: Array<T>): Array<T> {
    if (value instanceof Array) {
      return value;
    } else if (!value) {
      return [];
    }

    return [value];
  }

  protected date(value: string): Date {
    return fromUnixTime(this.number(value));
  }
}
