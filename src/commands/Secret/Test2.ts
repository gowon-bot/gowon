import { JobManager } from "../../jobs/JobManager";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { Logger } from "../../lib/Logger";
import { JobService, Queues } from "../../services/JobService";

export default class Test2 extends BaseCommand {
  description = "Testing testing 321";
  secretCommand = true;
  devCommand = true;

  jobService = new JobService();

  async run() {
    let queue = JobManager.getInstance().getQueue(Queues.LastFMIndexing);

    let jobs = await queue.getJobs(["active", "delayed", "paused", "waiting"]);

    console.log(Logger.formatObject(jobs));
  }
}
