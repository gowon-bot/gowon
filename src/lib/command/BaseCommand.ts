import {
  EmbedAuthorData,
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
  MentionedUserNotIndexedError,
  LastFMReverseLookupError,
  SenderUserNotIndexedError,
  UnknownError,
  UsernameNotRegisteredError,
  SenderUserNotAuthenticatedError,
  DMsAreOffError,
} from "../../errors";
import { GowonService } from "../../services/GowonService";
import { CommandGroup } from "./CommandGroup";
import { Logger } from "../Logger";
import { Command, Rollout } from "./Command";
import { TrackingService } from "../../services/TrackingService";
import { User } from "../../database/entity/User";
import { GowonClient } from "../GowonClient";
import { Validation, ValidationChecker } from "../validation/ValidationChecker";
import { Emoji, EmojiRaw } from "../Emoji";
import { Argument, Mention } from "./ArgumentType";
import { RunAs } from "./RunAs";
import { ucFirst } from "../../helpers";
import { checkRollout } from "../../helpers/permissions";
import { errorEmbed, gowonEmbed } from "../views/embeds";
import { isSessionKey } from "../../services/LastFM/LastFMAPIService";
import {
  buildRequestables,
  compareUsernames,
  GetMentionsOptions,
  GetMentionsReturn,
} from "../../helpers/getMentions";
import { MirrorballService } from "../../services/mirrorball/MirrorballService";
import { Chance } from "chance";
import {
  MirrorballUser,
  UserInput,
} from "../../services/mirrorball/MirrorballTypes";
import { MirrorballUsersService } from "../../services/mirrorball/services/MirrorballUsersService";
import { CommandRegistry } from "./CommandRegistry";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { SimpleMap } from "../../helpers/types";
import { AnalyticsCollector } from "../../analytics/AnalyticsCollector";
import { RollbarService } from "../../services/Rollbar/RollbarService";
import { NowPlayingEmbedParsingService } from "../../services/NowPlayingEmbedParsingService";
import { CommandAccess } from "./access/access";
import chalk from "chalk";

export interface Variation {
  name: string;
  variation: string[] | string;
  description?: string;
}

export interface Delegate<T> {
  delegateTo: { new (): Command };
  when(args: ParsedArguments<T>): boolean;
}

export type ArgumentName<T extends Arguments> =
  | keyof T["inputs"]
  | keyof T["mentions"];

export type ParsedArguments<T extends Arguments> = {
  [K in keyof T["inputs"]]?: Argument<T["inputs"][K]>;
} & {
  [K in keyof T["mentions"]]?: Mention<T["mentions"][K]>;
} & {
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

  protected debug = false;

  /**
   * Indexing metadata
   * (properties related to how commands are found)
   */
  name: string = this.constructor.name.toLowerCase();
  friendlyName: string = this.constructor.name.toLowerCase();
  aliases: Array<string> = [];
  variations: Variation[] = [];
  delegates: Delegate<ArgumentsType>[] = [];
  delegatedFrom?: Command;

  /**
   * Parent-child metadata
   * (properties related to a commands parents or children)
   */
  hasChildren = false;
  children?: CommandGroup;
  parentName?: string;

  /**
   * Descriptive metadata
   * (properties related to decribing commands for end users)
   */
  description: string = "No description for this command";
  category: string | undefined = undefined;
  subcategory: string | undefined = undefined;
  usage: string | string[] = "";
  customHelp?: { new (): Command } | undefined;

  /**
   * Authentication metadata
   * (properties related to who can access commands)
   */
  // Archived are commands that can't be run, but stick around for data purposes
  // Should be used to 'decommission' commands that aren't needed anymore
  archived = false;
  secretCommand: boolean = false;
  shouldBeIndexed: boolean = true;
  devCommand: boolean = false;
  access?: CommandAccess;
  rollout: Rollout = {};

  /**
   * Argument metadata
   * (properties related to what arguments a command takes)
   */
  arguments: Arguments = {};
  validation: Validation = {};

  /**
   * Run-specific data
   * (properties set before a command is run)
   */
  // Has to be any typed because the parsed flags aren't optionally typed
  // because they always will be either true or false
  // this is set by the FlagParser when this.parseArguments() is called
  parsedArguments: ParsedArguments<ArgumentsType> = {} as any;

  logger = new Logger();

  message!: Message;
  runAs!: RunAs;
  guild!: Guild;
  author!: DiscordUser;
  gowonClient!: GowonClient;

  ctx = this.generateContext({});

  /**
   * Misc metadata
   */
  responses: Array<MessageEmbed | string> = [];

  showLoadingAfter?: number;
  isCompleted = false;

  get friendlyNameWithParent(): string {
    return (
      (this.parentName ? this.parentName.trim() + " " : "") + this.friendlyName
    );
  }

  commandRegistry = CommandRegistry.getInstance();

  track = ServiceRegistry.get(TrackingService);
  usersService = ServiceRegistry.get(UsersService);
  gowonService = ServiceRegistry.get(GowonService);
  rollbarService = ServiceRegistry.get(RollbarService);
  mirrorballService = ServiceRegistry.get(MirrorballService);
  analyticsCollector = ServiceRegistry.get(AnalyticsCollector);
  mirrorballUsersService = ServiceRegistry.get(MirrorballUsersService);
  nowPlayingEmbedParsingService = ServiceRegistry.get(
    NowPlayingEmbedParsingService
  );

  generateContext(customContext: SimpleMap): any {
    return Object.assign(
      {
        logger: this.logger,
        command: this,
      },
      customContext
    );
  }

  async getChild(_: string, __: string): Promise<Command | undefined> {
    return undefined;
  }

  get id(): string {
    return md5(this.idSeed);
  }

  get prefix(): string {
    return this.gowonService.prefix(this.guild.id);
  }

  public setClient(client: GowonClient) {
    this.gowonClient = client;
    this.ctx.client = client;
  }

  abstract run(message: Message, runAs: RunAs): Promise<void>;

  async getMentions({
    senderRequired = false,
    usernameRequired = true,
    userArgumentName = "user" as ArgumentName<ArgumentsType>,
    inputArgumentName = "username" as ArgumentName<ArgumentsType>,
    lfmMentionArgumentName = "lfmUser" as ArgumentName<ArgumentsType>,
    idMentionArgumentName = "userID" as ArgumentName<ArgumentsType>,
    asCode = true,
    fetchDiscordUser = false,
    fetchMirrorballUser = false,
    reverseLookup = { required: false },
    authentificationRequired,
    requireIndexed,
    fromArguments,
  }: GetMentionsOptions<
    ArgumentName<ArgumentsType>
  > = {}): Promise<GetMentionsReturn> {
    const argumentsToUse = fromArguments || (this.parsedArguments as any);

    let user = argumentsToUse[userArgumentName] as DiscordUser,
      userID = argumentsToUse[idMentionArgumentName] as string,
      lfmUsername = argumentsToUse[lfmMentionArgumentName] as string,
      discordUsername = argumentsToUse["discordUsername"] as string;

    if (user && this.message.reference) {
      const reply = await this.message.fetchReference();

      if (this.nowPlayingEmbedParsingService.hasParsableEmbed(this.ctx, reply))
        if (
          this.gowonClient.isBot(user.id, [
            "gowon",
            "gowon development",
            "fmbot",
            "fmbot develop",
            "chuu",
          ])
        ) {
          user = (Array.from(this.message.mentions.users)[1] || [])[1];
        }
    }

    let mentionedUsername: string | undefined;
    let discordUser: DiscordUser | undefined;

    let senderDBUser: User | undefined;
    let mentionedDBUser: User | undefined;

    let senderMirrorballUser: MirrorballUser | undefined;
    let mentionedMirrorballUser: MirrorballUser | undefined;

    if (discordUsername) {
      discordUser = await this.getDiscordUserFromUsername(discordUsername);
    }

    try {
      senderDBUser = await this.usersService.getUser(
        this.ctx,
        this.message.author.id
      );
    } catch {}

    if (lfmUsername) {
      mentionedUsername = lfmUsername;
    } else if (user?.id || userID || discordUser) {
      try {
        const mentionedUser = await this.usersService.getUser(
          this.ctx,
          discordUser?.id || userID || `${user?.id}`
        );

        mentionedDBUser = mentionedUser;

        if (!mentionedUser?.lastFMUsername && usernameRequired) {
          throw new UsernameNotRegisteredError();
        }

        mentionedUsername = mentionedUser?.lastFMUsername;
      } catch {
        if (usernameRequired) throw new UsernameNotRegisteredError();
      }
    } else if (inputArgumentName && argumentsToUse[inputArgumentName]) {
      mentionedUsername = argumentsToUse[inputArgumentName] as string;
    }

    const perspective = this.usersService.perspective(
      senderDBUser?.lastFMUsername || "<no user>",
      mentionedUsername,
      asCode
    );

    if (!mentionedDBUser && mentionedUsername) {
      mentionedDBUser = await this.usersService.getUserFromLastFMUsername(
        this.ctx,
        mentionedUsername
      );

      if (reverseLookup.required && !mentionedDBUser)
        throw new LastFMReverseLookupError(
          mentionedUsername,
          requireIndexed,
          this.prefix
        );
    }

    const username = mentionedUsername || senderDBUser?.lastFMUsername;

    if (fetchDiscordUser) {
      let fetchedUser: DiscordUser | undefined;

      try {
        fetchedUser = await this.gowonClient.client.users.fetch(
          mentionedDBUser?.discordID || userID || this.author.id
        );
      } catch {}

      if (
        fetchedUser &&
        (compareUsernames(username, senderDBUser?.lastFMUsername) ||
          (compareUsernames(username, mentionedDBUser?.lastFMUsername) &&
            mentionedDBUser?.discordID === fetchedUser.id) ||
          userID === fetchedUser.id)
      ) {
        discordUser = fetchedUser;

        perspective.addDiscordUser(discordUser);
      } else discordUser = undefined;
    }

    if (fetchMirrorballUser) {
      const inputs: UserInput[] = [{ discordID: this.author.id }];

      const mentionedID =
        mentionedDBUser?.discordID || discordUser?.id || userID;

      if (mentionedID) {
        inputs.push({ discordID: mentionedID });
      }

      [senderMirrorballUser, mentionedMirrorballUser] =
        (await this.mirrorballUsersService.getMirrorballUser(
          this.ctx,
          inputs
        )) || [];
    }

    if (
      usernameRequired &&
      (!username || (senderRequired && !senderDBUser?.lastFMUsername))
    ) {
      throw new LogicError(
        `please sign in with a last.fm account! (\`${this.prefix}login\`)`,
        `Don't have one? You can create one at https://last.fm/join`
      );
    }

    const requestables = buildRequestables({
      senderUser: senderDBUser,
      mentionedUsername,
      mentionedUser: mentionedDBUser,
    });

    if (authentificationRequired && !isSessionKey(requestables?.requestable)) {
      throw new SenderUserNotAuthenticatedError(this.prefix);
    }

    const dbUser = mentionedDBUser || senderDBUser;

    if (requireIndexed && dbUser && !dbUser.isIndexed) {
      if (dbUser.id === mentionedDBUser?.id) {
        throw new MentionedUserNotIndexedError(this.prefix);
      } else if (dbUser.id === senderDBUser?.id) {
        if (!senderDBUser.lastFMSession) {
          throw new SenderUserNotAuthenticatedError(this.prefix);
        }
        throw new SenderUserNotIndexedError(this.prefix);
      }
    }

    const mirrorballUser =
      (mentionedMirrorballUser?.username?.toLowerCase() ===
      mentionedUsername?.toLowerCase()
        ? mentionedMirrorballUser
        : undefined) || (!mentionedUsername ? senderMirrorballUser : undefined);

    return {
      mentionedUsername,
      perspective,
      mentionedDBUser,
      senderUser: senderDBUser,
      discordUser,
      dbUser: dbUser!,
      senderMirrorballUser,
      mirrorballUser,
      ...requestables!,
    };
  }

  async prerun(): Promise<void> {}

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
    if (Chance().bool({ likelihood: 33 })) {
      this.usersService
        .getUser(this.ctx, this.author.id)
        .then(async (senderUser) => {
          if (
            senderUser &&
            !["update", "index", "login", "logout"].includes(this.name)
          ) {
            await Promise.all([
              this.mirrorballService.quietAddUserToGuild(
                this.ctx,
                this.author.id,
                this.guild.id
              ),
              senderUser.mirrorballUpdate(this.ctx),
            ]);
          }
        })
        .catch(() => {});
    }
  }

  async teardown() {
    if (this.debug) {
      console.log(this.constructor.name + "", this);
    }

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

      if ((this.parsedArguments as any).debug) {
        this.debug = true;
      }

      for (const delegate of this.delegates) {
        if (delegate.when(this.parsedArguments)) {
          const command = new delegate.delegateTo();
          command.setClient(this.gowonClient);
          command.delegatedFrom = this;
          await command.execute(message, runAs);
          return;
        }
      }

      this.logger.logCommand(this, message, runAs.toArray().join(" "));
      this.analyticsCollector.metrics.commandRuns.inc();

      new ValidationChecker(this.parsedArguments, this.validation).validate();

      await this.prerun();
      await this.run(message, runAs);
    } catch (e: any) {
      this.logger.logError(e);
      this.analyticsCollector.metrics.commandErrors.inc();
      this.rollbarService.logError(this.ctx, e);

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

  async sendWithFiles(content: MessageEmbed | string, files: [string]) {
    this.addResponse(content);

    const end = this.analyticsCollector.metrics.discordLatency.startTimer();

    if (typeof content === "string") {
      await this.message.channel.send({ content, files });
    } else {
      await this.message.channel.send({ embeds: [content], files });
    }
    end();
  }

  async send(
    content: MessageEmbed | string,
    withEmbed?: MessageEmbed
  ): Promise<Message> {
    this.ctx.logger.log("Discord", chalk`{grey Sending message}`);

    this.addResponse(content);

    if (withEmbed) {
      return await this.message.channel.send({
        content: content as string,
        embeds: [withEmbed],
      });
    }

    const end = this.analyticsCollector.metrics.discordLatency.startTimer();

    let response: Message;

    if (typeof content === "string") {
      response = await this.message.channel.send({ content });
    } else {
      response = await this.message.channel.send({ embeds: [content] });
    }

    end();

    return response;
  }

  async reply(
    content: string,
    settings: {
      to?: MessageResolvable;
      ping?: boolean;
      noUppercase?: boolean;
    } = {}
  ): Promise<Message> {
    this.ctx.logger.log("Discord", chalk`{grey Replying}`);

    const settingsWithDefaults = Object.assign({ ping: false }, settings);

    content =
      typeof content === "string" && !settings.noUppercase
        ? ucFirst(content)
        : content;

    this.addResponse(content);

    const end = this.analyticsCollector.metrics.discordLatency.startTimer();

    const response = await this.message.channel.send({
      content,
      reply: {
        messageReference: settingsWithDefaults.to || this.message,
      },
      allowedMentions: { repliedUser: settingsWithDefaults.ping },
    });

    end();

    return response;
  }

  async dmAuthor(content: string | MessageEmbed): Promise<Message> {
    const end = this.analyticsCollector.metrics.discordLatency.startTimer();

    let response: Message;

    try {
      if (typeof content === "string") {
        response = await this.author.send({ content });
      } else {
        response = await this.author.send({ embeds: [content] });
      }
    } catch (e: any) {
      throw e.message
        ?.toLowerCase()
        ?.includes("cannot send messages to this user")
        ? new DMsAreOffError()
        : e;
    }

    end();

    return response;
  }

  async traditionalReply(message: string): Promise<Message> {
    this.addResponse(message);

    const response = await this.send(
      `<@!${this.author.id}>, ` + message.trimStart()
    );

    return response;
  }

  checkRollout(): boolean {
    if (this.gowonClient.isDeveloper(this.author.id)) return true;

    return checkRollout(this.rollout, this.message);
  }

  public copy(): Command {
    return CommandRegistry.getInstance().make(this.id);
  }

  async getRepliedMessage(): Promise<Message | undefined> {
    if (this.message.reference) {
      return await this.message.fetchReference();
    }

    return undefined;
  }

  newEmbed(embed?: MessageEmbed): MessageEmbed {
    return gowonEmbed(this.message.member ?? undefined, embed);
  }

  generateEmbedAuthor(title?: string): EmbedAuthorData {
    return {
      name: title
        ? `${this.message.author.tag} | ${title}`
        : `${this.message.author.tag}`,
      iconURL: this.message.author.avatarURL() || undefined,
    };
  }

  protected async fetchUsername(id: string): Promise<string> {
    try {
      let member = await this.guild.members.fetch(id);
      return member.user.username;
    } catch {
      return this.gowonService.constants.unknownUserDisplay;
    }
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
    const embed = errorEmbed(this.newEmbed(), this.author, message, footer);

    await this.send(embed);
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
      this.message.channel.sendTyping();
    } catch {}
  }

  protected async getDiscordUserFromUsername(
    username: string
  ): Promise<DiscordUser | undefined> {
    const members = await this.guild.members.fetch();

    const member = members.find(
      (m) =>
        m.user.username.toLowerCase() === username ||
        m.nickname?.toLowerCase() === username
    );

    return member?.user;
  }

  protected messageIsReply(): boolean {
    return !!this.message.reference;
  }
}
