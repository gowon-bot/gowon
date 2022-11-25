import { ServerResponse } from "http";
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from "prom-client";
import { BaseService } from "../services/BaseService";

export class AnalyticsCollector extends BaseService {
  private register: Registry;

  metrics = {
    discordLatency: new Histogram({
      name: "discord_latency_seconds",
      help: "Latency of Discord requests in seconds",
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    }),
    lastFMLatency: new Histogram({
      name: "lastfm_latency_seconds",
      help: "Latency of Last.fm requests in seconds",
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      labelNames: ["category", "action"],
    }),
    commandRuns: new Counter({
      name: "command_runs",
      help: "Nunber of commands run",
    }),
    commandErrors: new Counter({
      name: "command_errors",
      help: "Nunber of commands errored",
    }),
    guildCount: new Gauge({
      name: "guild_count",
      help: "Number of guilds Gowon is in",
    }),
    userCount: new Gauge({
      name: "user_count",
      help: "Number of registered users",
    }),
  };

  constructor() {
    super();

    this.register = new Registry();

    this.register.setDefaultLabels({
      app: "gowon",
    });

    collectDefaultMetrics({ register: this.register });

    for (const metric of Object.values(this.metrics)) {
      this.register.registerMetric(metric);
    }
  }

  async handler(_: any, res: ServerResponse) {
    res.setHeader("Content-Type", this.register.contentType);
    res.end(await this.register.metrics());
  }
}
