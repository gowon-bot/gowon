import { Job } from "bull";
import { JobManager } from "../jobs/JobManager";
import { LFMIndexProcessor } from "../jobs/processors/LFMIndexProcessor";
import { BaseService } from "./BaseService";

export enum Queues {
  LastFMIndexing = "lastfm indexing",
}

export interface LFMIndexProgress {
  current: number;
  total: number;
}

export class JobService extends BaseService {
  private readonly jobManager = JobManager.getInstance();

  init() {
    const lastFMIndexingQueue = this.jobManager.getQueue(Queues.LastFMIndexing);

    const lfmIndexProcessor = new LFMIndexProcessor();
    lastFMIndexingQueue.process(
      lfmIndexProcessor.create().bind(lfmIndexProcessor)
    );
  }

  async indexLFMUser(
    username: string,
    callback: (job: Job) => void,
    progressCallback?: (job: Job, progress: LFMIndexProgress) => void
  ): Promise<Job> {
    const job = await this.jobManager
      .getQueue(Queues.LastFMIndexing)
      .add({ username });

    this.jobManager.subscribe(Queues.LastFMIndexing, job.id, callback);
    if (progressCallback)
      this.jobManager.subscribe(
        Queues.LastFMIndexing,
        job.id,
        progressCallback,
        "progress"
      );

    return job;
  }
}
