import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from "discord.js";
import { GowonService } from "../../../../../services/GowonService";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { TimeRange } from "../../../../timeAndDate/TimeRange";
import { GowonContext } from "../../../Context";
import { TimeRangeParser } from "../../parsers/TimeRangeParser";
import { BaseArgument, BaseArgumentOptions } from "../BaseArgument";

export interface TimeRangeArgumentOptions
  extends BaseArgumentOptions<TimeRange> {
  useOverall?: boolean;
}

export class TimeRangeArgument<
  OptionsT extends Partial<TimeRangeArgumentOptions> = {}
> extends BaseArgument<TimeRange, TimeRangeArgumentOptions, OptionsT> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  timeRangeParser = new TimeRangeParser(this.options);

  constructor(options?: OptionsT) {
    super((options ?? {}) as OptionsT);
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): TimeRange | undefined {
    const cleanContent = this.cleanContent(ctx, content);

    return this.timeRangeParser.parse(cleanContent) || this.getDefault();
  }

  parseFromCommandInteraction(
    interaction: ChatInputCommandInteraction,
    _: GowonContext,
    argumentName: string
  ): TimeRange | undefined {
    const range = interaction.options.getString(argumentName);
    const timeRange = range ? this.timeRangeParser.parse(range) : undefined;

    return timeRange || this.getDefault();
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addStringOption((option) =>
      this.baseOption(option, argumentName)
    );
  }
}
