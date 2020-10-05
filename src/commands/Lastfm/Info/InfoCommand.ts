import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { TagConsolidator } from "../../../lib/TagConsolidator";

export abstract class InfoCommand extends LastFMBaseCommand {
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
