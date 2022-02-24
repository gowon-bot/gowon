import { Message } from "discord.js";
import { GowonService } from "../../../../../services/GowonService";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { TimeRange } from "../../../../timeAndDate/helpers";
import { GowonContext } from "../../../Context";
import { TimeRangeParser } from "../../parsers/TimeRangeParser";
import { BaseArgument } from "../BaseArgument";

export interface TimeRangeArgumentOptions {
  fallback?: Duration | "overall";
  useOverall?: boolean;
}

export class TimeRangeArgument extends BaseArgument<
  TimeRange,
  TimeRangeArgumentOptions
> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  timeRangeParser = new TimeRangeParser(this.options);

  constructor(options: Partial<TimeRangeArgumentOptions> = {}) {
    super(options);
  }

  parseFromMessage(_: Message, content: string, ctx: GowonContext): TimeRange {
    const cleanContent = this.cleanContent(ctx, content);

    return this.timeRangeParser.parse(cleanContent)!;
  }

  parseFromInteraction(): TimeRange {
    return new TimeRange();
  }
}
