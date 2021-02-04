import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { Arguments } from "../../../lib/arguments/arguments";

export abstract class InfoCommand<
  T extends Arguments = Arguments
> extends LastFMBaseCommand<T> {
  shouldBeIndexed = false;
  subcategory = "info";

  tagConsolidator = new TagConsolidator();

  getLinkFromBio(bio: string): string | undefined {
    let matches = bio.match(/(?<=<a href=")(.*)(?=">)/) || [];

    return matches[0];
  }

  scrubReadMore(bio?: string): string | undefined {
    return bio?.replace(/<a href=".*/, "");
  }
}
