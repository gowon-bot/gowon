import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";
import { GowonService } from "../../../../../services/GowonService";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { TimeRange } from "../../../../timeAndDate/helpers";
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

  constructor(options: OptionsT | {} = {}) {
    super(options);
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): TimeRange | undefined {
    const cleanContent = this.cleanContent(ctx, content);

    return this.timeRangeParser.parse(cleanContent) || this.options.default;
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): TimeRange | undefined {
    const range = interaction.options.getString(argumentName);
    const timeRange = range ? this.timeRangeParser.parse(range) : undefined;

    return timeRange || this.options.default;
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addStringOption((option) =>
      this.baseOption(option, argumentName)
    );
  }
}
