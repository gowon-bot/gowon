import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Logger } from "../../../lib/Logger";
import { TagConsolidator } from "../../../lib/TagConsolidator";

export abstract class InfoCommand extends LastFMBaseCommand {
  shouldBeIndexed = false;

  tagConsolidator = new TagConsolidator();

  getLinkFromBio(bio: string): string | undefined {
    let matches = bio.match(/(?<=<a href=")(.*)(?=">)/) || [];
    
    return matches[0];
  }

  scrubReadMore(bio: string): string {
    return bio.replace(/<a href=".*/, "");
  }
}
