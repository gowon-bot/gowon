import { Message } from "discord.js";
import { GowonService } from "../../../../services/GowonService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { GowonContext } from "../../Context";
import {
  BaseArgument,
  BaseArgumentOptions,
  ContentBasedArgumentOptions,
  defaultIndexableOptions,
  SliceableArgumentOptions,
} from "./BaseArgument";

interface StringArrayArgumentOptions
  extends BaseArgumentOptions<string[]>,
    SliceableArgumentOptions,
    ContentBasedArgumentOptions {
  splitOn: string | RegExp;
}

export class StringArrayArgument<
  OptionsT extends Partial<StringArrayArgumentOptions>
> extends BaseArgument<string[], StringArrayArgumentOptions, OptionsT> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor(options?: OptionsT) {
    super({
      ...defaultIndexableOptions,
      splitOn: " ",
      ...(options ?? {}),
    } as OptionsT);
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): string[] | undefined {
    const cleanContent = this.cleanContent(ctx, content);

    const splitContent = cleanContent.split(this.options.splitOn);

    const element = this.getElementFromIndex<string | string[], {}>(
      splitContent,
      this.options.index
    );

    if (typeof element === "string") {
      return [element];
    }

    return element instanceof Array ? element : element ? [element] : element;
  }

  parseFromCommandInteraction(): string[] | undefined {
    return [];
  }
}
