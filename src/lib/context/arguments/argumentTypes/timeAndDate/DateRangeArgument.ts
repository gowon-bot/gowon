import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";
import { GowonService } from "../../../../../services/GowonService";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { DateRange } from "../../../../timeAndDate/DateRange";
import { GowonContext } from "../../../Context";
import { DateRangeParser } from "../../parsers/DateRangeParser";
import { BaseArgument, BaseArgumentOptions } from "../BaseArgument";

export interface DateRangeArgumentOptions
  extends BaseArgumentOptions<DateRange> {
  useOverall?: boolean;
}

export class DateRangeArgument<
  OptionsT extends Partial<DateRangeArgumentOptions> = {}
> extends BaseArgument<DateRange, DateRangeArgumentOptions, OptionsT> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  dateRangeParser = new DateRangeParser(this.options);

  constructor(options?: OptionsT) {
    super((options ?? {}) as OptionsT);
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): DateRange | undefined {
    const cleanContent = this.cleanContent(ctx, content);

    return this.dateRangeParser.parse(cleanContent) || this.getDefault();
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): DateRange | undefined {
    const range = interaction.options.getString(argumentName);
    const dateRange = range ? this.dateRangeParser.parse(range) : undefined;

    return dateRange || this.getDefault();
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addStringOption((option) =>
      this.baseOption(option, argumentName)
    );
  }
}
