import { CommandInteraction, Message } from "discord.js";
import { SimpleMap } from "../../helpers/types";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { isStringCleaning } from "../../lib/context/arguments/argumentTypes/BaseArgument";
import { isFlag } from "../../lib/context/arguments/argumentTypes/Flag";
import { debugFlag } from "../../lib/context/arguments/prefabArguments";

export class ArgumentParsingService extends BaseService {
  parseContext(context: GowonContext, args: ArgumentsMap): any {
    let parsedArgs: SimpleMap = {};

    if (context.payload.isMessage()) {
      parsedArgs = this.parseMessage(context.payload.source, context, args);
    } else if (context.payload.isInteraction()) {
      parsedArgs = this.parseInteraction(context.payload.source, context, args);
    }

    for (const [argName, arg] of Object.entries(args)) {
      arg.validate(parsedArgs[argName], argName);
    }

    return parsedArgs;
  }

  private parseInteraction(
    interaction: CommandInteraction,
    context: GowonContext,
    args: ArgumentsMap
  ) {
    return Object.entries(args).reduce((acc, [name, value]) => {
      const parsedValue = value.parseFromInteraction(
        interaction,
        context,
        name.toLowerCase()
      );

      if (parsedValue !== null && parsedValue !== undefined) {
        acc[name] = parsedValue;
      }

      return acc;
    }, {} as SimpleMap<any>);
  }

  private parseMessage(
    message: Message,
    context: GowonContext,
    args: ArgumentsMap
  ) {
    const { flags, content: withoutFlags } = this.parseAndRemoveFlags(
      message,
      context,
      Object.assign(args, { debug: debugFlag })
    );

    const { mentions, content: withoutMentions } = this.parseAndRemoveMentions(
      message,
      withoutFlags,
      context,
      args
    );

    const inputs = this.parseInputs(message, withoutMentions, context, args);

    return { ...inputs, ...mentions, ...flags };
  }

  private parseInputs(
    message: Message,
    content: string,
    context: GowonContext,
    args: ArgumentsMap
  ) {
    return Object.entries(args)
      .filter(([_, value]) => !value.mention)
      .reduce((acc, [name, value]) => {
        acc[name] = value.parseFromMessage(message, content, context);

        return acc;
      }, {} as SimpleMap<any>);
  }

  private parseAndRemoveFlags(
    message: Message,
    context: GowonContext,
    args: ArgumentsMap
  ): { content: string; flags: SimpleMap<boolean> } {
    const flags = this.parseFlags(message, context, args);
    const content = this.removeFlags(message.content, args);

    return { content, flags };
  }

  private parseAndRemoveMentions(
    message: Message,
    content: string,
    context: GowonContext,
    args: ArgumentsMap
  ): { content: string; mentions: SimpleMap<any> } {
    const mentions = this.parseMentions(message, content, context, args);
    const newContent = this.removeMentions(content, args);

    return { content: newContent, mentions };
  }

  private parseMentions(
    message: Message,
    content: string,
    context: GowonContext,
    args: ArgumentsMap
  ) {
    return Object.entries(args)
      .filter(([_, value]) => value.mention)
      .reduce((acc, [name, value]) => {
        acc[name] = value.parseFromMessage(message, content, context);

        return acc;
      }, {} as SimpleMap<any>);
  }

  private removeMentions(content: string, args: ArgumentsMap): string {
    let newContent = content;

    for (const arg of Object.values(args)) {
      if (isStringCleaning(arg)) {
        newContent = arg.clean(newContent);
      }
    }

    return newContent;
  }

  private parseFlags(
    message: Message,
    context: GowonContext,
    args: ArgumentsMap
  ) {
    return Object.entries(args)
      .filter(([_, value]) => isFlag(value))
      .reduce((acc, [name, value]) => {
        acc[name] = value.parseFromMessage(message, message.content, context) as boolean;

        return acc;
      }, {} as SimpleMap<boolean>);
  }

  private removeFlags(content: string, args: ArgumentsMap): string {
    let newContent = content;

    for (const arg of Object.values(args)) {
      if (isFlag(arg)) {
        newContent = arg.clean(newContent);
      }
    }

    return newContent;
  }
}
