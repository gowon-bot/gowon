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
import { RunAs } from "../AliasChecker";

export interface Variation {
  variationString?: string;
  variationRegex?: RegExp;
  description?: string;
}
export interface Command {
  execute(message: Message, runAs: RunAs): Promise<void>;

  variations: Variation[];
  aliases: Array<string>;
  arguments: Arguments;
  secretCommand: boolean;
  name: string;
  description: string;
  shouldBeIndexed: boolean;
  category: string | undefined;

  hasChildren: boolean;
  children?: CommandManager;
  parentName?: string;
  getChild(...names: string[]): Command | undefined;
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
  runAs: Array<string> = [];

  parsedArguments: ParsedArguments = {};

  usersService = new UsersService(this.logger);
  botMomentService = BotMomentService.getInstance();

  hasChildren = false;
  children?: CommandManager;
  parentName?: string;
  hasChild(..._: string[]): boolean {
    return false;
  }
  getChild(..._: string[]): Command | undefined {
    return undefined;
  }

  abstract async run(message: Message, runAs: RunAs): Promise<void>;

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

  async prerun(_: Message): Promise<void> {}

  private async setup(message: Message) {
    message.channel.startTyping();
    this.logger.openCommandHeader(this);
  }

  private async teardown(message: Message) {
    message.channel.stopTyping();
    this.logger.closeCommandHeader(this);
  }

  async execute(message: Message, runAs: RunAs) {
    await this.setup(message);

    try {
      this.parsedArguments = this.parseArguments(message, runAs);
      this.logger.logCommand(this, message, runAs.toArray().join(" "));
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

    await this.teardown(message);
  }

  parseArguments(message: Message, runAs: RunAs): ParsedArguments {
    let parser = new ArgumentParser(this.arguments);

    return parser.parse(message, runAs);
  }
}

export class NoCommand extends BaseCommand {
  async run() {}
  async execute() {}
}
