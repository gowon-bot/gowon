import { Guild, Message, MessageEmbed, User as DiscordUser } from "discord.js";
import md5 from "js-md5";
import { UsersService } from "../../services/dbservices/UsersService";
import { Arguments, ArgumentParser } from "../arguments/arguments";
import {
  LogicError,
  ReverseLookupError,
  UnknownError,
  UsernameNotRegisteredError,
} from "../../errors";
import { GowonService } from "../../services/GowonService";
import { CommandManager } from "./CommandManager";
import { Logger } from "../Logger";
import { Command } from "./Command";
import { TrackingService } from "../../services/TrackingService";
import { User } from "../../database/entity/User";
import { Perspective } from "../Perspective";
import { GowonClient } from "../GowonClient";
import { Validation, ValidationChecker } from "../validation/ValidationChecker";
import { GowonEmbed } from "../../helpers/Embeds";
import { Emoji, EmojiRaw } from "../Emoji";
import { Argument, Mention } from "./ArgumentType";
import { RunAs } from "./RunAs";

export interface Variation {
  name: string;
  variation: string[] | string;
  description?: string;
}

export interface Delegate<T> {
  delegateTo: { new (): Command };
  when(args: ParsedArguments<T>): boolean;
}

type ArgumentName<T extends Arguments> =
  | keyof T["inputs"]
  | keyof T["mentions"];

export type ParsedArguments<T extends Arguments> = {
  [K in keyof T["inputs"]]?: Argument<T["inputs"][K]>;
} &
  {
    [K in keyof T["mentions"]]?: Mention<T["mentions"][K]>;
  };

export abstract class BaseCommand<ArgumentsType extends Arguments = Arguments>
  implements Command {
  /**
   * idSeed is the seed for the generated command id
   * **Must be unique among all commands!**
   */
  abstract idSeed: string;

  logger = new Logger();

  name: string = this.constructor.name.toLowerCase();
  friendlyName: string = this.constructor.name.toLowerCase();
  aliases: Array<string> = [];
  variations: Variation[] = [];
  description: string = "No description for this command";
  secretCommand: boolean = false;
  shouldBeIndexed: boolean = true;
  devCommand: boolean = false;

  arguments: Arguments = {};
  validation: Validation = {};

  parsedArguments: ParsedArguments<ArgumentsType> = {};

  category: string | undefined = undefined;
  subcategory: string | undefined = undefined;
  usage: string | string[] = "";

  delegates: Delegate<ArgumentsType>[] = [];
  delegatedFrom?: Command;

  message!: Message;
  runAs!: RunAs;
  guild!: Guild;
  author!: DiscordUser;
  gowonClient!: GowonClient;

  responses: Array<MessageEmbed | string> = [];

  showLoadingAfter?: number;
  isCompleted = false;

  get friendlyNameWithParent(): string {
    return (
      (this.parentName ? this.parentName.trim() + " " : "") + this.friendlyName
    );
  }

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
    return md5(this.idSeed);
  }

  abstract run(message: Message, runAs: RunAs): Promise<void>;

  async parseMentions({
    senderRequired = false,
    usernameRequired = true,
    userArgumentName = "user" as ArgumentName<ArgumentsType>,
    inputArgumentName = "username" as ArgumentName<ArgumentsType>,
    lfmMentionArgumentName = "lfmUser" as ArgumentName<ArgumentsType>,
    idMentionArgumentName = "userID" as ArgumentName<ArgumentsType>,
    asCode = true,
    fetchDiscordUser = false,
    reverseLookup = { lastFM: false, optional: false },
  }: {
    senderRequired?: boolean;
    usernameRequired?: boolean;
    userArgumentName?: ArgumentName<ArgumentsType>;
    inputArgumentName?: ArgumentName<ArgumentsType>;
    lfmMentionArgumentName?: ArgumentName<ArgumentsType>;
    idMentionArgumentName?: ArgumentName<ArgumentsType>;
    asCode?: boolean;
    fetchDiscordUser?: boolean;
    reverseLookup?: { lastFM?: boolean; optional?: boolean };
  } = {}): Promise<{
    senderUsername: string;
    mentionedUsername?: string;
    username: string;
    perspective: Perspective;
    dbUser?: User;
    senderUser?: User;
    discordUser?: DiscordUser;
  }> {
    let user = (this.parsedArguments[userArgumentName] as any) as User,
      userID = this.parsedArguments[idMentionArgumentName] as string,
      lfmUser = this.parsedArguments[lfmMentionArgumentName] as string;

    let mentionedUsername: string | undefined;
    let dbUser: User | undefined;
    let discordUser: DiscordUser | undefined;
    let senderUser: User | undefined;

    try {
      senderUser = await this.usersService.getUser(this.message.author.id);
    } catch {}

    if (lfmUser) {
      mentionedUsername = lfmUser;
    } else if (user?.id || userID) {
      try {
        let mentionedUser = await this.usersService.getUser(
          userID || `${user?.id}`
        );

        dbUser = mentionedUser;

        if (!mentionedUser?.lastFMUsername && usernameRequired)
          throw new UsernameNotRegisteredError();

        mentionedUsername = mentionedUser.lastFMUsername;
      } catch {
        throw new UsernameNotRegisteredError();
      }
    } else if (inputArgumentName && this.parsedArguments[inputArgumentName]) {
      mentionedUsername = this.parsedArguments[inputArgumentName] as string;
    }

    let perspective = this.usersService.perspective(
      senderUser?.lastFMUsername || "<no user>",
      mentionedUsername,
      asCode
    );

    if (reverseLookup.lastFM && !dbUser && mentionedUsername) {
      dbUser = await this.usersService.getUserFromLastFMUsername(
        mentionedUsername
      );

      if (!reverseLookup.optional && !dbUser)
        throw new ReverseLookupError("Last.fm username");
    }

    let username = mentionedUsername || senderUser?.lastFMUsername;

    if (fetchDiscordUser) {
      let fetchedUser = (
        await this.guild.members.fetch(
          dbUser?.discordID || userID || this.author.id
        )
      ).user;

      if (
        username === senderUser?.lastFMUsername ||
        (username === dbUser?.lastFMUsername &&
          dbUser?.discordID === fetchedUser.id) ||
        userID === fetchedUser.id
      ) {
        discordUser = fetchedUser;

        perspective.addDiscordUser(discordUser);
      } else discordUser = undefined;
    }

    if (
      usernameRequired &&
      (!username || (senderRequired && !senderUser?.lastFMUsername))
    )
      throw new LogicError(
        `please sign in with a last.fm account! (\`${await this.gowonService.prefix(
          this.guild.id
        )}login <lastfm username>)\``
      );

    return {
      username: username || "",
      senderUsername: senderUser?.lastFMUsername || "",
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

    if (this.showLoadingAfter) {
      setTimeout(() => {
        if (!this.isCompleted) {
          this.message.react(Emoji.loading);
        }
      }, this.showLoadingAfter * 1000);
    }
  }

  async teardown() {
    this.message.channel.stopTyping();
    this.logger.closeCommandHeader(this);
    this.isCompleted = true;
    if (this.showLoadingAfter) {
      this.message.reactions
        .resolve(EmojiRaw.loading)
        ?.users.remove(this.gowonClient.client.user!);
    }
  }

  async execute(message: Message, runAs: RunAs) {
    this.message = message;
    this.runAs = runAs;
    this.guild = message.guild!;
    this.author = message.author;

    await this.setup();

    try {
      this.parsedArguments = (await this.parseArguments(runAs)) as any;

      for (let delegate of this.delegates) {
        if (delegate.when(this.parsedArguments)) {
          let command = new delegate.delegateTo();
          command.gowonClient = this.gowonClient;
          command.delegatedFrom = this;
          await command.execute(message, runAs);
          this.message.channel.stopTyping();
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

  async parseArguments(runAs: RunAs): Promise<ParsedArguments<ArgumentsType>> {
    let parser = new ArgumentParser(this.arguments);

    return (await parser.parse(
      this.message,
      runAs
    )) as ParsedArguments<ArgumentsType>;
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

  protected async fetchUsername(id: string): Promise<string> {
    try {
      let member = await this.guild.members.fetch(id);
      return member.user.username;
    } catch {
      return this.gowonService.constants.unknownUserDisplay;
    }
  }

  protected newEmbed(): MessageEmbed {
    return GowonEmbed(this.message.member ?? undefined);
  }

  protected async serverUserIDs({
    filterCrownBannedUsers,
  }: { filterCrownBannedUsers?: boolean } = {}): Promise<string[]> {
    let filter = (_: string) => true;

    if (filterCrownBannedUsers) {
      let crownBannedUsers = await this.gowonService.getCrownBannedUsers(
        this.guild
      );

      let purgatoryRole = await this.gowonService.getPurgatoryRole(this.guild);

      let usersInPurgatory = purgatoryRole
        ? (await this.guild.members.fetch())
            .filter((m) => m.roles.cache.has(purgatoryRole!))
            .map((m) => m.user.id)
        : [];

      filter = (id: string) => {
        return !crownBannedUsers.includes(id) && !usersInPurgatory.includes(id);
      };
    }

    return (await this.guild.members.fetch())
      .map((u) => u.user.id)
      .filter(filter);
  }

  protected variationWasUsed(...names: string[]): boolean {
    for (let variation of this.variations.filter((v) =>
      names.includes(v.name)
    )) {
      const variations =
        variation.variation instanceof Array
          ? variation.variation
          : [variation.variation];

      if (variations.find((v) => this.runAs.variationWasUsed(v))) return true;
    }

    return false;
  }
}
