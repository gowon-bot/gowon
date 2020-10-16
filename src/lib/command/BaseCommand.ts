import { Guild, Message, MessageEmbed, User as DiscordUser } from "discord.js";
import md5 from "js-md5";
import { UsersService } from "../../services/dbservices/UsersService";
import {
  Arguments,
  ParsedArguments,
  ArgumentParser,
} from "../arguments/arguments";
import {
  LogicError,
  UnknownError,
  UsernameNotRegisteredError,
} from "../../errors";
import { GowonService } from "../../services/GowonService";
import { CommandManager } from "./CommandManager";
import { Logger } from "../Logger";
import { RunAs } from "../AliasChecker";
import { Command } from "./Command";
import { TrackingService } from "../../services/TrackingService";
import { User } from "../../database/entity/User";
import { Perspective } from "../Perspective";
import { GowonClient } from "../GowonClient";
import { Validation, ValidationChecker } from "../validation/ValidationChecker";

export interface Variation {
  variationString?: string;
  variationRegex?: RegExp;
  description?: string;
  friendlyString?: string;
}

export interface Delegate {
  delegateTo: { new (): Command };
  when(args: { [key: string]: any }): boolean;
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
  validation: Validation = {};

  category: string | undefined = undefined;
  subcategory: string | undefined = undefined;
  usage: string | string[] = "";

  delegates: Delegate[] = [];
  delegatedFrom?: Command;

  message!: Message;
  guild!: Guild;
  author!: DiscordUser;
  client!: GowonClient;

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

  async getChild(_: string, __: string): Promise<Command | undefined> {
    return undefined;
  }

  get id(): string {
    return md5(this.name + this.parentName + this.category);
  }

  abstract async run(message: Message, runAs: RunAs): Promise<void>;

  async parseMentions({
    senderRequired = false,
    usernameRequired = true,
    inputArgumentName = "username",
    asCode = true,
    fetchDiscordUser = false,
    reverseLookup = { lastFM: false },
  }: {
    senderRequired?: boolean;
    usernameRequired?: boolean;
    inputArgumentName?: string;
    asCode?: boolean;
    fetchDiscordUser?: boolean;
    reverseLookup?: { lastFM?: boolean };
  } = {}): Promise<{
    senderUsername: string;
    mentionedUsername?: string;
    username: string;
    perspective: Perspective;
    dbUser?: User;
    senderUser?: User;
    discordUser?: DiscordUser;
  }> {
    let { user, userID, lfmUser } = this.parsedArguments as {
      user?: User;
      userID?: string;
      lfmUser?: string;
    };

    let senderUser = await this.usersService.getUser(this.message.author.id);

    let mentionedUsername: string | undefined;
    let dbUser: User | undefined;
    let discordUser: DiscordUser | undefined;

    if (lfmUser) {
      mentionedUsername = lfmUser;
    } else if (user?.id || userID) {
      try {
        let mentionedUser = await this.usersService.getUser(
          userID || `${user?.id}`
        );

        dbUser = mentionedUser;

        if (!mentionedUser?.lastFMUsername)
          throw new UsernameNotRegisteredError();

        mentionedUsername = mentionedUser.lastFMUsername;
      } catch {
        throw new UsernameNotRegisteredError();
      }
    } else if (inputArgumentName && this.parsedArguments[inputArgumentName]) {
      mentionedUsername = this.parsedArguments[inputArgumentName];
    }

    let perspective = this.usersService.perspective(
      senderUser.lastFMUsername,
      mentionedUsername,
      asCode
    );

    if (reverseLookup.lastFM && !dbUser && mentionedUsername) {
      dbUser = await this.usersService.getUserFromLastFMUsername(
        mentionedUsername
      );
    }

    let username = mentionedUsername || senderUser.lastFMUsername;

    if (fetchDiscordUser) {
      discordUser = (
        await this.guild.members.fetch(
          dbUser?.discordID || userID || this.author.id
        )
      ).user;
    }

    if (
      usernameRequired &&
      (!username || (senderRequired && !senderUser?.lastFMUsername))
    )
      throw new LogicError(
        `Please sign in! (\`${await this.gowonService.prefix(
          this.guild.id
        )}login <username>)\``
      );

    return {
      username,
      senderUsername: senderUser.lastFMUsername,
      mentionedUsername,
      perspective,
      dbUser,
      senderUser,
      discordUser,
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
      this.parsedArguments = await this.parseArguments(runAs);

      for (let delegate of this.delegates) {
        if (delegate.when(this.parsedArguments)) {
          let command = new delegate.delegateTo();
          command.client = this.client;
          command.delegatedFrom = this;
          await command.execute(message, runAs);
          return;
        }
      }

      this.logger.logCommand(this, message, runAs.toArray().join(" "));

      new ValidationChecker(this.parsedArguments, this.validation).validate();

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

  async parseArguments(runAs: RunAs): Promise<ParsedArguments> {
    let parser = new ArgumentParser(this.arguments);

    return await parser.parse(this.message, runAs);
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
