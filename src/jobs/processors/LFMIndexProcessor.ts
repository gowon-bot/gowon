import { Job } from "bull";
import { Paginator } from "../../lib/Paginator";
import { CachedScrobblesService } from "../../services/dbservices/CachedScrobblesService";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { BaseProcessor } from "./BaseProcessor";

interface JobData {
  username: string;
}

export class LFMIndexProcessor extends BaseProcessor<void, JobData> {
  lastFMService = new LastFMService();
  cachedScrobblesService = new CachedScrobblesService();

  protected async process(job: Job<JobData>) {
    if (!(await job.isActive())) {
      throw new Error("Job aborted!");
    }

    const username = job.data.username;

    const maxPages = (
      await this.lastFMService.recentTracks({
        limit: 1000,
        username,
      })
    )["@attr"].totalPages.toInt();

    const paginator = new Paginator(
      this.lastFMService.recentTracksExtended.bind(this.lastFMService),
      maxPages,
      { username, limit: 1000 }
    );

    for await (let page of paginator.backwardsIterator()) {
      if (!(await job.isActive())) {
        throw new Error("Job aborted!");
      }

      paginator.maxPages = page["@attr"].totalPages.toInt();

      job.progress({
        current:
          page["@attr"].totalPages.toInt() - page["@attr"].page.toInt() + 1,
        total: page["@attr"].totalPages.toInt(),
      });

      await this.cachedScrobblesService.cache(page.track);

      await this.saveProgress();
    }

    return;
  }

  async saveProgress() {}
}
