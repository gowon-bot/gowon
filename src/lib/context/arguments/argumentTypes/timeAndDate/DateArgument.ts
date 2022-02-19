import { Message } from "discord.js";
import { GowonService } from "../../../../../services/GowonService";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { GowonContext } from "../../../Context";
import { BaseArgument } from "../BaseArgument";
import { parseDate } from "../../../../timeAndDate/helpers";

export interface DateArgumentOptions {
  parsers: string[];
}

export class DateArgument extends BaseArgument<Date, DateArgumentOptions> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor(options: Partial<DateArgumentOptions> = {}) {
    super(options, {
      parsers: ServiceRegistry.get(GowonService).constants.dateParsers,
    });
  }

  parseFromMessage(_: Message, content: string, context: GowonContext): Date {
    const cleanContent = this.gowonService.removeCommandName(
      content,
      context.runAs,
      context.guild.id
    );

    return parseDate(cleanContent, ...this.options.parsers)!;
  }

  parseFromInteraction(): Date {
    return new Date();
  }
}
