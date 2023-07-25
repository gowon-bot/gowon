import { add, differenceInSeconds } from "date-fns";
import { Requestable } from "../../services/LastFM/LastFMAPIService";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { GowonContext } from "../context/Context";
import { DateRange } from "../timeAndDate/DateRange";

export interface PacePrediction {
  scrobbleRate: number;
  prediction: Date;
  milestone: number;
}

export class PaceCalculator {
  private lastFMService = ServiceRegistry.get(LastFMService);

  constructor(private ctx: GowonContext, private requestable: Requestable) {}

  private calculateScrobblesPerHour(
    scrobbles: number,
    dateRange: DateRange
  ): number {
    const diff = differenceInSeconds(dateRange.to!, dateRange.from!) / 3600;

    return scrobbles / diff;
  }

  private makePrediction(
    milestone: number,
    currentScrobbles: number,
    rate: number
  ): Date {
    const hoursToGoal = (milestone - currentScrobbles) / rate;

    return add(new Date(), { hours: hoursToGoal });
  }

  private async calculateFromOverall(
    milestone: number
  ): Promise<PacePrediction> {
    const userInfo = await this.lastFMService.userInfo(this.ctx, {
      username: this.requestable,
    });

    const rate = this.calculateScrobblesPerHour(
      userInfo.scrobbleCount,
      new DateRange({
        from: userInfo.registeredAt,
        to: new Date(),
      })
    );

    return {
      scrobbleRate: rate,
      prediction: this.makePrediction(milestone, userInfo.scrobbleCount, rate),
      milestone,
    };
  }

  private async calculateFromDateRange(
    dateRange: DateRange,
    milestone: number
  ): Promise<PacePrediction> {
    const [totalScrobbles, scrobblesOverDateRange] = await Promise.all([
      this.lastFMService.getNumberScrobbles(this.ctx, this.requestable),
      this.lastFMService.getNumberScrobbles(
        this.ctx,
        this.requestable,
        dateRange.from,
        dateRange.to
      ),
    ]);

    const rate = this.calculateScrobblesPerHour(
      scrobblesOverDateRange,
      dateRange
    );

    return {
      scrobbleRate: rate,
      prediction: this.makePrediction(milestone, totalScrobbles, rate),
      milestone,
    };
  }

  private async getNearestMilestone(): Promise<number> {
    const overallScrobbles = await this.lastFMService.getNumberScrobbles(
      this.ctx,
      this.requestable
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
    dateRange: DateRange,
    milestone?: number
  ): Promise<PacePrediction> {
    if (!milestone) milestone = await this.getNearestMilestone();

    if (dateRange.from) {
      return await this.calculateFromDateRange(dateRange, milestone);
    } else return await this.calculateFromOverall(milestone);
  }
}
