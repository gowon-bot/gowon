import Queue, { Job, Queue as QueueType } from "bull";

export type JobCallback = (job: Job, ...args: any[]) => void;

export class JobManager {
  private static instance?: JobManager;

  private constructor() {}

  public static getInstance(): JobManager {
    if (!this.instance) this.instance = new JobManager();
    return this.instance;
  }

  // Instance methods and properties
  public queues: { [queueName: string]: QueueType } = {};
  public subscriptions: {
    [queueName: string]: {
      [event: string]: { [id: string]: JobCallback };
    };
  } = {};

  public getQueue(queueName: string): QueueType {
    if (!this.queues[queueName]) this.createQueue(queueName);

    return this.queues[queueName];
  }

  public subscribe(
    queueName: string,
    id: string | number,
    callback: JobCallback,
    event = "completed"
  ) {
    if (!this.subscriptions[queueName]) this.subscriptions[queueName] = {};
    if (!this.subscriptions[queueName][event])
      this.subscriptions[queueName][event] = {};

    this.subscriptions[queueName][event][`${id}`] = callback;
  }

  async stopAll() {
    console.log("Stopping all running jobs...");
    for (let queue of Object.values(this.queues)) {
      let jobs = await queue.getJobs([
        "active",
        "delayed",
        "paused",
        "waiting",
      ]);

      for (let job of jobs) {
        await job.discard();
        await job.moveToFailed({ message: "Shutdown" });
      }
    }
  }

  private createQueue(queueName: string) {
    const queue = new Queue(queueName);

    queue.on("completed", this.notifier("completed").bind(this));
    queue.on("progress", this.notifier("progress").bind(this));

    this.queues[queueName] = queue;
  }

  private notifier(event: string): JobCallback {
    return (job: Job, ...args: any[]) => {
      if (
        this.subscriptions[job.queue.name] &&
        this.subscriptions[job.queue.name][event][`${job.id}`]
      )
        this.subscriptions[job.queue.name][event][`${job.id}`](job, ...args);
    };
  }
}
