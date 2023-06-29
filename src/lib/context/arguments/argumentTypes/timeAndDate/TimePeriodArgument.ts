import { ChatInputCommandInteraction, Message } from "discord.js";
import { GowonService } from "../../../../../services/GowonService";
import { LastFMPeriod } from "../../../../../services/LastFM/LastFMService.types";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { GowonContext } from "../../../Context";
import { TimePeriodParser } from "../../parsers/TimePeriodParser";
import { BaseArgument, BaseArgumentOptions } from "../BaseArgument";
import { SlashCommandBuilder } from "../SlashCommandTypes";

export interface TimePeriodArgumentOptions
  extends BaseArgumentOptions<LastFMPeriod> {}

const periodChoices: { name: string; value: LastFMPeriod }[] = [
  { name: "Alltime", value: "overall" },
  { name: "Week", value: "7day" },
  { name: "Month", value: "1month" },
  { name: "Quarter (3 months)", value: "3month" },
  { name: "Half (6 months)", value: "6month" },
  { name: "Year", value: "12month" },
];

export class TimePeriodArgument<
  OptionsT extends Partial<TimePeriodArgumentOptions> = {}
> extends BaseArgument<LastFMPeriod, TimePeriodArgumentOptions, OptionsT> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  timePeriodParser = new TimePeriodParser({ fallback: this.getDefault() });

  constructor(options?: OptionsT) {
    super((options ?? {}) as OptionsT);
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): LastFMPeriod | undefined {
    const cleanContent = this.cleanContent(ctx, content);

    return this.timePeriodParser.parse(cleanContent);
  }

  parseFromCommandInteraction(
    interaction: ChatInputCommandInteraction,
    _: GowonContext,
    argumentName: string
  ): LastFMPeriod | undefined {
    return (interaction.options.getString(argumentName) ||
      this.options.default) as LastFMPeriod;
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addStringOption((option) =>
      this.baseOption(option, argumentName).addChoices(...periodChoices)
    );
  }
}
