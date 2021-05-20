import { add, differenceInSeconds } from "date-fns";
import { TimeRange } from "../../helpers/date";
import { LastFMService } from "../../services/LastFM/LastFMService";

export interface PacePrediction {
  scrobbleRate: number;
  prediction: Date;
  milestone: number;
}

export class PaceCalculator {
  constructor(private lastFMService: LastFMService, private username: string) {}

  private calculateScrobblesPerHour(
    scrobbles: number,
    timeRange: TimeRange
  ): number {
    let diff = differenceInSeconds(timeRange.to!, timeRange.from!) / 3600;

    return scrobbles / diff;
  }

  private makePrediction(
    milestone: number,
    currentScrobbles: number,
    rate: number
  ): Date {
    let hoursToGoal = (milestone - currentScrobbles) / rate;

    return add(new Date(), { hours: hoursToGoal });
  }

  private async calculateFromOverall(
    milestone: number
  ): Promise<PacePrediction> {
    let userInfo = await this.lastFMService.userInfo({
      username: this.username,
    });

    let rate = this.calculateScrobblesPerHour(userInfo.scrobbleCount, {
      from: userInfo.registeredAt,
      to: new Date(),
    });

    return {
      scrobbleRate: rate,
      prediction: this.makePrediction(milestone, userInfo.scrobbleCount, rate),
      milestone,
    };
  }

  private async calculateFromTimeRange(
    timeRange: TimeRange,
    milestone: number
  ): Promise<PacePrediction> {
    let [totalScrobbles, scrobblesOverTimeRange] = await Promise.all([
      this.lastFMService.getNumberScrobbles(this.username),
      this.lastFMService.getNumberScrobbles(
        this.username,
        timeRange.from,
        timeRange.to
      ),
    ]);

    let rate = this.calculateScrobblesPerHour(
      scrobblesOverTimeRange,
      timeRange
    );

    return {
      scrobbleRate: rate,
      prediction: this.makePrediction(milestone, totalScrobbles, rate),
      milestone,
    };
  }

  private async getNearestMilestone(): Promise<number> {
    let overallScrobbles = await this.lastFMService.getNumberScrobbles(
      this.username
    );

    if (overallScrobbles < 5000) {
      return 5000;
    } else if (overallScrobbles < 10000) {
      return 10000;
    } else {
      return ~~(overallScrobbles / 25000) * 25000 + 25000;
    }
  }

  async calculate(
    timeRange: TimeRange,
    milestone?: number
  ): Promise<PacePrediction> {
    if (!milestone) milestone = await this.getNearestMilestone();

    if (timeRange.from) {
      return await this.calculateFromTimeRange(timeRange, milestone);
    } else return await this.calculateFromOverall(milestone);
  }
}
