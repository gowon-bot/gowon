import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { ClearCachedLoveTracks } from "./jobs/ClearCachedLoveTracks";
import { IntervaledJob } from "./jobs/IntervaledJob";

export class IntervaledJobsService extends BaseService {
  private jobs: { new (): IntervaledJob }[] = [ClearCachedLoveTracks];

  public start(ctx: GowonContext): void {
    this.jobs.forEach((job) => {
      new job().setTimeout(ctx);
    });
  }
}
