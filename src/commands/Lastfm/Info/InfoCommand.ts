import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

export abstract class InfoCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseCommand<T> {
  shouldBeIndexed = false;
  subcategory = "info";

  tagConsolidator = new TagConsolidator();

  getLinkFromBio(bio: string): string | undefined {
    const matches = bio.match(/(?<=<a href=")(.*)(?=">)/) || [];

    return matches[0];
  }

  scrubReadMore(bio?: string): string | undefined {
    return bio?.replace(/<a href=".*/, "").trim();
  }
}
