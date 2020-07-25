import { LastFMBaseCommand } from "../LastFMBaseCommand";

export abstract class InfoCommand extends LastFMBaseCommand {
  shouldBeIndexed = false;

  getLinkFromBio(bio: string): string | undefined {
    return (bio.match(/(?<=<a href=")(.*)(?=">)/) || [])[0];
  }

  scrubReadMore(bio:string): string {
    return bio.replace(/<a href=".*/, "")
  }
}
