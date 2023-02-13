import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";
import { GowonService } from "../../../../../services/GowonService";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { constants } from "../../../../constants";
import { parseDate } from "../../../../timeAndDate/helpers/parse";
import { GowonContext } from "../../../Context";
import { BaseArgument, BaseArgumentOptions } from "../BaseArgument";

export interface DateArgumentOptions extends BaseArgumentOptions<Date> {
  parsers: string[];
}

export class DateArgument<
  OptionsT extends Partial<DateArgumentOptions> = {}
> extends BaseArgument<Date, DateArgumentOptions, OptionsT> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor(options?: OptionsT) {
    super({
      parsers: constants.dateParsers,
      ...(options ?? {}),
    } as OptionsT);
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): Date | undefined {
    const cleanContent = this.cleanContent(ctx, content);
    const date = parseDate(cleanContent, ...this.options.parsers);

    return (date || this.getDefault())!;
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): Date | undefined {
    const dateString = interaction.options.getString(argumentName);

    const date = dateString
      ? parseDate(dateString, ...this.options.parsers)
      : undefined;

    return (date || this.getDefault())!;
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addStringOption((option) =>
      this.baseOption(option, argumentName)
    );
  }
}
