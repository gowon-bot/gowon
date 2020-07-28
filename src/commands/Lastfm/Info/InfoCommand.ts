import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Logger } from "../../../lib/Logger";

export abstract class InfoCommand extends LastFMBaseCommand {
  shouldBeIndexed = false;

  getLinkFromBio(bio: string): string | undefined {
    let matches = (bio.match(/(?<=<a href=")(.*)(?=">)/) || []);

    Logger.log("Mathches", Logger.formatObject(matches))
    return matches[0]
  }

  scrubReadMore(bio:string): string {
    return bio.replace(/<a href=".*/, "")
  }
}
