import { Job } from "bull";

export abstract class BaseProcessor<JobReturnT = any, JobParamsT = any> {
  protected active: boolean = false;

  create() {
    this.active = true;
    return this.process;
  }

  stop() {
    this.active = false;
  }

  protected abstract process(job: Job<JobParamsT>): Promise<JobReturnT>;
}
