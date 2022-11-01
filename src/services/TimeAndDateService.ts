import { GowonContext } from "../lib/context/Context";
import { SettingsService } from "../lib/settings/SettingsService";
import { TimeZone } from "../lib/timeAndDate/TimeZone";
import { BaseService } from "./BaseService";
import { ServiceRegistry } from "./ServicesRegistry";

export type TimeZonedDate = Date;

export type TimeAndDateServiceMutableContext = {
  userTimeZone?: TimeZone | "";
};

export type TimeAndDateServiceContext = GowonContext<{
  mutable?: TimeAndDateServiceMutableContext;
}>;

export class TimeAndDateService extends BaseService<TimeAndDateServiceContext> {
  private get settingsService(): SettingsService {
    return ServiceRegistry.get(SettingsService);
  }

  async setUserTimeZone(
    ctx: GowonContext,
    discordID: string,
    timeZone: TimeZone
  ) {
    this.log(
      ctx,
      `Setting timezone as ${timeZone.asString()} for user ${discordID}`
    );

    await this.settingsService.set(
      ctx,
      "timezone",
      { userID: discordID },
      timeZone.asString()
    );
  }

  async getUserTimeZone(
    ctx: GowonContext,
    discordID: string
  ): Promise<TimeZone | undefined> {
    this.log(ctx, `fetching timezone for user ${discordID}`);

    const timeZone = this.settingsService.get("timezone", {
      userID: discordID,
    });

    return TimeZone.fromString(timeZone);
  }

  public async saveUserTimeZoneInContext(ctx: GowonContext, discordID: string) {
    this.ctx(ctx).mutable.userTimeZone = await this.getUserTimeZone(
      ctx,
      discordID
    );

    return this.ctx(ctx).mutable.userTimeZone;
  }

  public applyUserTimeZoneFromContext(
    ctx: GowonContext,
    date: Date
  ): TimeZonedDate {
    const userTimeZone = this.ctx(ctx).mutable.userTimeZone;

    if (userTimeZone instanceof TimeZone) {
      return userTimeZone.apply(date);
    }

    return date;
  }
}
