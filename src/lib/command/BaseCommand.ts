import { Message } from "discord.js";
import {
  UsersService,
  Perspective,
} from "../../services/dbservices/UsersService";
import {
  Arguments,
  ParsedArguments,
  ArgumentParser,
} from "../arguments/arguments";
import { UnknownError } from "../../errors";
import { BotMomentService } from "../../services/BotMomentService";
import { Mention } from "../arguments/mentions";
import { CommandManager } from "./CommandManager";

export interface Variation {
  variationString?: string;
  variationRegex?: RegExp;
  description?: string;
}
export interface Command {
  execute(message: Message, runAs?: string): Promise<void>;
  hasAlias(alias: string): boolean;

  variations: Variation[];
  aliases: Array<string>;
  arguments: Arguments;
  secretCommand: boolean;
  name: string;
  description: string;
  shouldBeIndexed: boolean;
  category: string | undefined;

  children?: CommandManager;
  getChild(name: string): Command | undefined;
}

export abstract class BaseCommand implements Command {
  name: string = this.constructor.name.toLowerCase();
  aliases: Array<string> = [];
  variations: Variation[] = [];
  description: string = "No description for this command";
  secretCommand: boolean = false;
  shouldBeIndexed: boolean = true;
  arguments: Arguments = {};
  category: string | undefined = undefined;

  parsedArguments: ParsedArguments = {};

  usersService = new UsersService();
  botMomentService = BotMomentService.getInstance();

  children?: CommandManager;
  getChild(name: string): Command | undefined {
    return undefined;
  }

  abstract async run(message: Message, runAs?: string): Promise<void>;

  async parseMentionedUsername(
    message: Message,
    options: { asCode?: boolean; argumentName?: string } = {
      asCode: true,
      argumentName: "user",
    }
  ): Promise<{
    senderUsername: string;
    mentionedUsername?: string;
    username: string;
    perspective: Perspective;
  }> {
    let user = this.parsedArguments.user as Mention;

    let senderUsername = await this.usersService.getUsername(message.author.id);

    let mentionedUsername: string;

    if (typeof user === "string") {
      mentionedUsername = user;
    } else {
      mentionedUsername =
        user && (await this.usersService.getUsername(user.id));
    }

    let username = mentionedUsername || senderUsername;

    let perspective = this.usersService.perspective(
      senderUsername,
      mentionedUsername,
      options.asCode
    );

    return { senderUsername, mentionedUsername, username, perspective };
  }

  async prerun(message: Message): Promise<void> {}

  async execute(message: Message, runAs?: string) {
    message.channel.startTyping();
    try {
      this.parsedArguments = this.parseArguments(message, runAs || this.name);
      await this.prerun(message);
      await this.run(message, runAs);
    } catch (e) {
      if (e.isClientFacing) {
        await message.channel.send(e.message);
        message.channel.stopTyping()
      } else {
        message.channel.stopTyping();
        await message.channel.send(new UnknownError().message);
        throw e;
      }
    }
    message.channel.stopTyping();
  }

  hasAlias(alias: string): boolean {
    return (
      this.aliases.map((a) => a.toLowerCase()).includes(alias.toLowerCase()) ||
      this.hasVariation(alias)
    );
  }

  hasVariation(variation: string): boolean {
    for (let v of this.variations) {
      if (v.variationString) {
        return v.variationString === variation;
      } else if (v.variationRegex) {
        return v.variationRegex.test(variation);
      }
    }
    return false;
  }

  parseArguments(message: Message, runAs: string): ParsedArguments {
    let parser = new ArgumentParser(this.arguments);

    return parser.parse(message, runAs);
  }
}

export class NoCommand extends BaseCommand {
  async run() {}
  async execute() {}
}
