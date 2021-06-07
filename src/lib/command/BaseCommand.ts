import {
  Guild,
  Message,
  MessageEmbed,
  MessageResolvable,
  User as DiscordUser,
} from "discord.js";
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
import { Command, Rollout } from "./Command";
import { TrackingService } from "../../services/TrackingService";
import { User } from "../../database/entity/User";
import { Perspective } from "../Perspective";
import { GowonClient } from "../GowonClient";
import { Validation, ValidationChecker } from "../validation/ValidationChecker";
import { Emoji, EmojiRaw } from "../Emoji";
import { Argument, Mention } from "./ArgumentType";
import { RunAs } from "./RunAs";
import { ucFirst } from "../../helpers";
import { checkRollout } from "../../helpers/permissions";
import { gowonEmbed } from "../views/embeds";
import {
  isSessionKey,
  Requestable,
} from "../../services/LastFM/LastFMAPIService";
import {
  buildRequestables,
  compareUsernames,
} from "../../helpers/parseMentions";

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
  } &
  {
    [K in keyof T["flags"]]: boolean;
  };

export abstract class BaseCommand<ArgumentsType extends Arguments = Arguments>
  implements Command
{
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
  customHelp?: { new (): Command } | undefined;

  arguments: Arguments = {};
  validation: Validation = {};

  // Has to be any typed because the parsed flags aren't optionally typed
  // because they always will be either true or false
  // this is set by the FlagParser when this.parseArguments() is called
  parsedArguments: ParsedArguments<ArgumentsType> = {} as any;

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

  rollout: Rollout = {};

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

  protected readonly errorColour = "#ED008E";

  async getChild(_: string, __: string): Promise<Command | undefined> {
    return undefined;
  }

  get id(): string {
    return md5(this.idSeed);
  }

  get prefix(): string {
    return this.gowonService.prefix(this.guild.id);
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
    reverseLookup = { required: false },
    authentificationRequired,
  }: {
    senderRequired?: boolean;
    usernameRequired?: boolean;
    userArgumentName?: ArgumentName<ArgumentsType>;
    inputArgumentName?: ArgumentName<ArgumentsType>;
    lfmMentionArgumentName?: ArgumentName<ArgumentsType>;
    idMentionArgumentName?: ArgumentName<ArgumentsType>;
    asCode?: boolean;
    fetchDiscordUser?: boolean;
    reverseLookup?: { required?: boolean };
    authentificationRequired?: boolean;
  } = {}): Promise<{
    senderUsername: string;
    senderRequestable: Requestable;

    username: string;
    requestable: Requestable;

    mentionedUsername?: string;
    perspective: Perspective;

    dbUser?: User;
    senderUser?: User;
    discordUser?: DiscordUser;
  }> {
    let user = this.parsedArguments[userArgumentName] as any as User,
      userID = this.parsedArguments[idMentionArgumentName] as any as string,
      lfmUser = this.parsedArguments[lfmMentionArgumentName] as any as string;

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
        if (usernameRequired) throw new UsernameNotRegisteredError();
      }
    } else if (inputArgumentName && this.parsedArguments[inputArgumentName]) {
      mentionedUsername = this.parsedArguments[
        inputArgumentName
      ] as any as string;
    }

    let perspective = this.usersService.perspective(
      senderUser?.lastFMUsername || "<no user>",
      mentionedUsername,
      asCode
    );

    if (!dbUser && mentionedUsername) {
      dbUser = await this.usersService.getUserFromLastFMUsername(
        mentionedUsername
      );

      if (reverseLookup.required && !dbUser)
        throw new ReverseLookupError("Last.fm username");
    }

    let username = mentionedUsername || senderUser?.lastFMUsername;

    if (fetchDiscordUser) {
      let fetchedUser: DiscordUser | undefined;

      try {
        fetchedUser = await this.gowonClient.client.users.fetch(
          dbUser?.discordID || userID || this.author.id
        );
      } catch {}

      if (
        fetchedUser &&
        (compareUsernames(username, senderUser?.lastFMUsername) ||
          (compareUsernames(username, dbUser?.lastFMUsername) &&
            dbUser?.discordID === fetchedUser.id) ||
          userID === fetchedUser.id)
      ) {
        discordUser = fetchedUser;

        perspective.addDiscordUser(discordUser);
      } else discordUser = undefined;
    }

    if (
      usernameRequired &&
      (!username || (senderRequired && !senderUser?.lastFMUsername))
    ) {
      throw new LogicError(
        `please sign in with a last.fm account! (\`${this.prefix}login\`)`,
        `Don't have a one? You can create one at https://last.fm/join`
      );
    }

    const requestables = buildRequestables({
      senderUser,
      mentionedUsername,
      mentionedUser: dbUser,
    });

    if (authentificationRequired && !isSessionKey(requestables?.requestable)) {
      throw new LogicError(
        "This command requires you to be authenticated, please logout and then login in again!"
      );
    }

    return {
      mentionedUsername,
      perspective,
      dbUser,
      senderUser,
      discordUser,
      ...requestables!,
    };
  }

  async prerun(_: Message): Promise<void> {}

  async setup() {
    this.startTyping();
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
    this.stopTyping();
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

    if (!this.checkRollout()) {
      return;
    }

    await this.setup();

    try {
      this.parsedArguments = this.parseArguments(runAs) as any;

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

      if (e.isClientFacing && !e.silent) {
        await this.sendError(e.message, e.footer);
      } else if (!e.isClientFacing) {
        await this.sendError(new UnknownError().message);
      }
    }

    await this.teardown();
  }

  parseArguments(runAs: RunAs): ParsedArguments<ArgumentsType> {
    let parser = new ArgumentParser(this.arguments);

    return parser.parse(this.message, runAs) as ParsedArguments<ArgumentsType>;
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

  async send(
    message: MessageEmbed | string,
    withEmbed?: MessageEmbed
  ): Promise<Message> {
    this.addResponse(message);

    if (withEmbed) {
      return await this.message.channel.send(message, { embed: withEmbed });
    }

    return await this.message.channel.send(message);
  }

  async reply(
    message: string,
    settings: {
      to?: MessageResolvable;
      ping?: boolean;
    } = {}
  ): Promise<Message> {
    const settingsWithDefaults = Object.assign({ ping: false }, settings);

    message = typeof message === "string" ? ucFirst(message) : message;

    this.addResponse(message);

    return await this.message.reply(message, {
      replyTo: settingsWithDefaults.to,
      allowedMentions: { repliedUser: settingsWithDefaults.ping },
    });
  }

  async traditionalReply(message: string): Promise<Message> {
    this.addResponse(message);
    return await this.message.channel.send(
      `<@!${this.author.id}>, ` + message.trimStart()
    );
  }

  checkRollout(): boolean {
    if (this.gowonClient.isDeveloper(this.author.id)) return true;

    return checkRollout(this.rollout, this.message);
  }

  protected async fetchUsername(id: string): Promise<string> {
    try {
      let member = await this.guild.members.fetch(id);
      return member.user.username;
    } catch {
      return this.gowonService.constants.unknownUserDisplay;
    }
  }

  protected newEmbed(embed?: MessageEmbed): MessageEmbed {
    return gowonEmbed(this.message.member ?? undefined, embed);
  }

  protected generateEmbedAuthor(title?: string): [string, string | undefined] {
    return [
      title
        ? `${this.message.author.tag} | ${title}`
        : `${this.message.author.tag}`,
      this.message.author.avatarURL() || undefined,
    ];
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

  protected async sendError(message: string, footer = "") {
    const errorEmbed = this.newEmbed()
      .setColor(this.errorColour)
      .setAuthor(
        `Error | ${this.author.username}#${this.author.discriminator}`,
        this.author.avatarURL() ?? undefined
      )
      .setDescription(ucFirst(message))
      .setFooter(footer);

    await this.send(errorEmbed);
  }

  protected get scopes() {
    const guild = { guildID: this.guild.id };
    const user = { userID: this.author.id };
    const guildMember = Object.assign(guild, user);

    return { guild, user, guildMember };
  }

  protected startTyping() {
    // Sometimes Discord throws 500 errors on this call
    // To reduce the amount of errors when discord is crashing
    // this is try / caught
    try {
      this.message.channel.startTyping();
    } catch {}
  }

  protected stopTyping() {
    try {
      this.message.channel.stopTyping();
    } catch {}
  }
}
