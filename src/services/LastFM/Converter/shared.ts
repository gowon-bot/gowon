import { Image } from "../LastFMService.types";

export class ImageCollection {
  constructor(private images: Image[]) {}

  get(size: string): string | undefined {
    return this.images.find((i) => i.size === size)?.["#text"];
  }
}
