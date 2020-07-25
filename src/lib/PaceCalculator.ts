import { TimeRange } from "../helpers/date";
import { LastFMService } from "../services/LastFMService";
import moment from "moment";

export interface PacePrediction {
  scrobbleRate: number;
  prediction: Date;
}

export class PaceCalculator {
  username: string;
  lastFMService: LastFMService;

  constructor(lastFMService: LastFMService, username: string) {
    this.lastFMService = lastFMService;
    this.username = username;
  }

  private calculateScrobblesPerHour(
    scrobbles: number,
    timeRange: TimeRange
  ): number {
    let diff = moment(timeRange.to).diff(timeRange.from, "hour");

    return scrobbles / diff;
  }

  private makePrediction(
    milestone: number,
    currentScrobbles: number,
    rate: number
  ): Date {
    let hoursToGoal = (milestone - currentScrobbles) / rate;

    return moment().add(hoursToGoal, "hours").toDate();
  }

  private async calculateFromOverall(
    milestone: number
  ): Promise<PacePrediction> {
    let userInfo = await this.lastFMService.userInfo(this.username);
    let scrobblingSince = moment
      .unix(userInfo.registered.unixtime.toInt())
      .toDate();

    let rate = this.calculateScrobblesPerHour(userInfo.playcount.toInt(), {
      from: scrobblingSince,
    });

    return {
      scrobbleRate: rate,
      prediction: this.makePrediction(
        milestone,
        userInfo.playcount.toInt(),
        rate
      ),
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
    };
  }

  async calculate(
    timeRange: TimeRange,
    milestone: number
  ): Promise<PacePrediction> {
    if (timeRange.from) {
      return await this.calculateFromTimeRange(timeRange, milestone);
    } else return await this.calculateFromOverall(milestone);
  }
}
