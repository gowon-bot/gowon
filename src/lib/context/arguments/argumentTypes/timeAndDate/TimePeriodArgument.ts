import { Message } from "discord.js";
import { GowonService } from "../../../../../services/GowonService";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { GowonContext } from "../../../Context";
import { BaseArgument } from "../BaseArgument";
import { LastFMPeriod } from "../../../../../services/LastFM/LastFMService.types";
import { TimePeriodParser } from "../../parsers/TimePeriodParser";

export interface TimePeriodArgumentOptions {
  fallback?: LastFMPeriod;
}

export class TimePeriodArgument extends BaseArgument<
  LastFMPeriod,
  TimePeriodArgumentOptions
> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  timePeriodParser = new TimePeriodParser(this.options);

  constructor(options: Partial<TimePeriodArgumentOptions> = {}) {
    super(options);
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): LastFMPeriod {
    const cleanContent = this.cleanContent(ctx, content);

    return this.timePeriodParser.parse(cleanContent)!;
  }

  parseFromInteraction(): LastFMPeriod {
    return "overall";
  }
}
