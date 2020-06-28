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
import { Logger } from "../Logger";

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
  parentName?: string;
  getChild(name: string): Command | undefined;
}

export abstract class BaseCommand implements Command {
  protected logger = new Logger();

  name: string = this.constructor.name.toLowerCase();
  aliases: Array<string> = [];
  variations: Variation[] = [];
  description: string = "No description for this command";
  secretCommand: boolean = false;
  shouldBeIndexed: boolean = true;
  arguments: Arguments = {};
  category: string | undefined = undefined;

  parsedArguments: ParsedArguments = {};

  usersService = new UsersService(this.logger);
  botMomentService = BotMomentService.getInstance();

  children?: CommandManager;
  parentName?: string;
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
    this.logger.openCommandHeader(this)
    
    try {
      this.parsedArguments = this.parseArguments(message, runAs || this.name);
      this.logger.logCommand(this, message, runAs);
      await this.prerun(message);
      await this.run(message, runAs);
    } catch (e) {

      this.logger.logError(e);

      if (e.isClientFacing) {
        await message.channel.send(e.message);
      } else {
        await message.channel.send(new UnknownError().message);
      }
    }
    message.channel.stopTyping();
    this.logger.closeCommandHeader(this)
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
