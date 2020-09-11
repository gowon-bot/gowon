import { Guild, Message, MessageEmbed, User as DiscordUser } from "discord.js";
import md5 from "js-md5";
import { UsersService } from "../../services/dbservices/UsersService";
import {
  Arguments,
  ParsedArguments,
  ArgumentParser,
} from "../arguments/arguments";
import { UnknownError, UsernameNotRegisteredError } from "../../errors";
import { GowonService } from "../../services/GowonService";
import { Mention } from "../arguments/mentions";
import { CommandManager } from "./CommandManager";
import { Logger } from "../Logger";
import { RunAs } from "../AliasChecker";
import { ParentCommand } from "./ParentCommand";
import { TrackingService } from "../../services/TrackingService";
import { User } from "../../database/entity/User";
import { Perspective } from "../Perspective";

export interface Variation {
  variationString?: string;
  variationRegex?: RegExp;
  description?: string;
  friendlyString?: string;
}
export interface Command {
  execute(message: Message, runAs: RunAs): Promise<void>;
  id: string;

  variations: Variation[];
  aliases: Array<string>;
  arguments: Arguments;
  secretCommand: boolean;
  shouldBeIndexed: boolean;

  name: string;
  friendlyName: string;
  friendlyNameWithParent?: string;
  description: string;
  category: string | undefined;
  subcategory: string | undefined;
  usage: string | string[];

  hasChildren: boolean;
  children?: CommandManager;
  parentName?: string;
  parent?: ParentCommand;
  getChild(...names: string[]): Command | undefined;
}

export abstract class BaseCommand implements Command {
  logger = new Logger();

  name: string = this.constructor.name.toLowerCase();
  friendlyName: string = this.constructor.name.toLowerCase();
  aliases: Array<string> = [];
  variations: Variation[] = [];
  description: string = "No description for this command";
  secretCommand: boolean = false;
  shouldBeIndexed: boolean = true;
  arguments: Arguments = {};
  category: string | undefined = undefined;
  subcategory: string | undefined = undefined;
  usage: string | string[] = "";

  message!: Message;
  guild!: Guild;
  author!: DiscordUser;

  responses: Array<MessageEmbed | string> = [];

  get friendlyNameWithParent(): string {
    return (
      (this.parentName ? this.parentName.trim() + " " : "") + this.friendlyName
    );
  }

  parsedArguments: ParsedArguments = {};

  usersService = new UsersService(this.logger);
  gowonService = GowonService.getInstance();
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
    return md5(this.name + this.parentName + this.category);
  }

  abstract async run(message: Message, runAs: RunAs): Promise<void>;

  async parseMentionedUsername(
    options: {
      asCode?: boolean;
      argumentName?: string;
      inputArgumentName?: string;
      suppressError?: boolean;
      throwOnNoMention?: boolean;
    } = {
      asCode: true,
      argumentName: "user",
      suppressError: false,
    }
  ): Promise<{
    senderUsername: string;
    mentionedUsername?: string;
    username: string;
    perspective: Perspective;
    dbUser?: User;
    senderUser?: User;
  }> {
    let dbUser: User | undefined;
    let user = this.parsedArguments.user as Mention;
    let inputUsername =
      options.inputArgumentName &&
      (this.parsedArguments[options.inputArgumentName] as string);

    let senderUser = await this.usersService.getUser(this.message.author.id);

    let mentionedUsername: string | undefined;

    if (typeof user === "string") {
      mentionedUsername = user;
    } else if (user) {
      try {
        let mentionedUser = await this.usersService.getUser(user.id);

        dbUser = mentionedUser;

        mentionedUsername = mentionedUser?.lastFMUsername;
      } catch {
        throw new UsernameNotRegisteredError(user.username);
      }
    }

    let username =
      inputUsername || mentionedUsername || senderUser.lastFMUsername;
    mentionedUsername = inputUsername || mentionedUsername;

    dbUser = username === senderUser.lastFMUsername ? senderUser : dbUser;

    let perspective = this.usersService.perspective(
      senderUser.lastFMUsername,
      mentionedUsername,
      options.asCode
    );

    if (!username && !options.suppressError) {
      if (!senderUser.lastFMUsername)
        throw new UsernameNotRegisteredError(true);
      else
        throw new UsernameNotRegisteredError(
          user instanceof DiscordUser ? user.username : undefined
        );
    }

    return {
      senderUsername: senderUser.lastFMUsername,
      mentionedUsername,
      username,
      perspective,
      dbUser,
      senderUser,
    };
  }

  async prerun(_: Message): Promise<void> {}

  async setup() {
    this.message.channel.startTyping();
    this.logger.openCommandHeader(this);
  }

  async teardown() {
    this.message.channel.stopTyping();
    this.logger.closeCommandHeader(this);
  }

  async execute(message: Message, runAs: RunAs) {
    this.message = message;
    this.guild = message.guild!;
    this.author = message.author;
    await this.setup();

    try {
      this.parsedArguments = this.parseArguments(runAs);
      this.logger.logCommand(this, message, runAs.toArray().join(" "));
      await this.prerun(message);
      await this.run(message, runAs);
    } catch (e) {
      this.logger.logError(e);
      this.track.error(e);

      if (e.isClientFacing) {
        await this.reply(e.message);
      } else {
        await this.reply(new UnknownError().message);
      }
    }

    await this.teardown();
  }

  parseArguments(runAs: RunAs): ParsedArguments {
    let parser = new ArgumentParser(this.arguments);

    return parser.parse(this.message, runAs);
  }

  addResponse(res: MessageEmbed | string) {
    this.responses.push(res);
  }

  async sendWithFiles(message: MessageEmbed | string, files: [string]) {
    this.addResponse(message);
    await this.message.channel.send(message, {
      files,
    });
  }

  async send(message: MessageEmbed | string): Promise<Message> {
    this.addResponse(message);
    return await this.message.channel.send(message);
  }
  async reply(message: MessageEmbed | string): Promise<Message> {
    this.addResponse(message);
    return await this.message.reply(message);
  }
}

export class NoCommand extends BaseCommand {
  async run() {}
  async execute() {}
}
