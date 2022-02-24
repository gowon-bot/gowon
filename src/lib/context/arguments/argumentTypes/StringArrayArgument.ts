import { Message } from "discord.js";
import { GowonService } from "../../../../services/GowonService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { GowonContext } from "../../Context";
import { BaseArgument, defaultIndexableOptions } from "./BaseArgument";
import { StringArgumentOptions } from "./StringArgument";

export class StringArrayArgument extends BaseArgument<
  string[],
  StringArgumentOptions
> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor(options: Partial<StringArgumentOptions> = {}) {
    super(defaultIndexableOptions, { splitOn: " " }, options);
  }

  parseFromMessage(_: Message, content: string, ctx: GowonContext): string[] {
    const cleanContent = this.cleanContent(ctx, content);

    const splitContent = cleanContent.split(this.options.splitOn);

    const element = this.getElementFromIndex(splitContent, this.options.index);

    if (typeof this.options.index == "number") return [element];
    return element;
  }

  parseFromInteraction() {
    return [];
  }
}
