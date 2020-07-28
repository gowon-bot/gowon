import { Message } from "discord.js";
import md5 from "js-md5";
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
import { ParentCommand } from "./ParentCommand";
import { TrackingService } from "../../services/TrackingService";
import { User } from "../../database/entity/User";

export interface Variation {
  variationString?: string;
  variationRegex?: RegExp;
  description?: string;
}
export interface Command {
  execute(message: Message, runAs: RunAs): Promise<void>;
  id: string;

  variations: Variation[];
  aliases: Array<string>;
  arguments: Arguments;
  secretCommand: boolean;
  name: string;
  friendlyName: string;
  description: string;
  shouldBeIndexed: boolean;
  category: string | undefined;

  hasChildren: boolean;
  children?: CommandManager;
  parentName?: string;
  parent?: ParentCommand;
  getChild(...names: string[]): Command | undefined;
}

export abstract class BaseCommand implements Command {
  protected logger = new Logger();

  name: string = this.constructor.name.toLowerCase();
  friendlyName: string = this.constructor.name.toLowerCase();
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
  track = new TrackingService(this.logger);

  hasChildren = false;
  children?: CommandManager;
  parentName?: string;
  hasChild(..._: string[]): boolean {
    return false;
  }
  getChild(..._: string[]): Command | undefined {
    return undefined;
  }

  get id(): string {
    return md5(
      this.name +
        this.description +
        this.parentName +
        this.arguments +
        this.aliases
    );
  }

  abstract async run(message: Message, runAs: RunAs): Promise<void>;

  async parseMentionedUsername(
    message: Message,
    options: {
      asCode?: boolean;
      argumentName?: string;
      inputArgumentName?: string;
    } = {
      asCode: true,
      argumentName: "user",
    }
  ): Promise<{
    senderUsername: string;
    mentionedUsername?: string;
    username: string;
    perspective: Perspective;
    dbUser?: User;
  }> {
    let dbUser: User | undefined;
    let user = this.parsedArguments.user as Mention;
    let inputUsername =
      options.inputArgumentName &&
      (this.parsedArguments[options.inputArgumentName] as string);

    let senderUser = await this.usersService.getUser(
      message.author.id,
      message.guild?.id!
    );

    let mentionedUsername: string | undefined;

    if (typeof user === "string") {
      mentionedUsername = user;
    } else {
      let mentionedUser = user
        ? await this.usersService.getUser(user.id, message.guild?.id!)
        : undefined;

      dbUser = mentionedUser;

      mentionedUsername = mentionedUser?.lastFMUsername;
    }

    let username =
      inputUsername || mentionedUsername || senderUser.lastFMUsername;

    dbUser = username === senderUser.lastFMUsername ? senderUser : dbUser;

    let perspective = this.usersService.perspective(
      senderUser.lastFMUsername,
      mentionedUsername,
      options.asCode
    );

    return {
      senderUsername: senderUser.lastFMUsername,
      mentionedUsername,
      username,
      perspective,
      dbUser,
    };
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
      this.track.error(e);

      if (e.isClientFacing) {
        await message.reply(e.message);
      } else {
        await message.reply(new UnknownError().message);
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
