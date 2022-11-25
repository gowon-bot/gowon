import { ServerResponse } from "http";
import { BaseMockService } from "./BaseMockService";

const mockMetric = {
  inc: () => { },
} as any;

export class MockAnalyticsCollector extends BaseMockService {
  metrics = {
    discordLatency: mockMetric,
    lastFMLatency: mockMetric,
    commandRuns: mockMetric,
    commandErrors: mockMetric,
    guildCount: mockMetric,
    userCount: mockMetric,
  };

  async handler(_: any, _res: ServerResponse) { }
}
