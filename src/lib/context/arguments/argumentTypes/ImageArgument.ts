import { CommandInteraction, Message } from "discord.js";
import { Image } from "../../../views/Image";
import { GowonContext } from "../../Context";
import { URLParser } from "../parsers/URLParser";
import {
  BaseArgument,
  BaseArgumentOptions,
  SliceableArgumentOptions,
  defaultIndexableOptions,
} from "./BaseArgument";
import { SlashCommandBuilder } from "./SlashCommandTypes";

export interface ImageArgumentOptions
  extends BaseArgumentOptions<Image[]>,
    SliceableArgumentOptions {}

export class ImageArgument<
  OptionsT extends Partial<ImageArgumentOptions> = {}
> extends BaseArgument<Image[], ImageArgumentOptions, OptionsT> {
  private urlParser = new URLParser();

  constructor(options?: OptionsT) {
    super({
      ...defaultIndexableOptions,
      ...(options ?? {}),
    } as OptionsT);
  }

  parseFromMessage(
    message: Message,
    content: string,
    ctx: GowonContext
  ): Image[] | undefined {
    const cleanContent = this.cleanContent(ctx, content);

    const attachments = message.attachments
      .filter((a) => a.contentType?.startsWith("image/") || false)
      .map((a) => a.url);

    const messageURLs = this.urlParser.parse(cleanContent);

    const images: Image[] = [...attachments, ...messageURLs].map(Image.fromURL);

    return this.getFromArray(images) || this.getDefault();
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): Image[] | undefined {
    const string = interaction.options.getString(argumentName)!;

    const messageURLs = this.urlParser.parse(string);

    const images: Image[] = messageURLs.map(Image.fromURL);

    return this.getFromArray(images) || this.getDefault();
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addStringOption((option) => {
      return this.baseOption(option, argumentName);
    });
  }

  private getFromArray(array: Image[]): Image[] | undefined {
    const element = this.getElementFromIndex(array, this.options.index);

    return element instanceof Array || element === undefined
      ? element
      : [element];
  }
}
