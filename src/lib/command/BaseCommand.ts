import {
  CommandInteraction,
  EmbedAuthorData,
  Guild,
  Message,
  MessageEmbed,
  User as DiscordUser,
} from "discord.js";
import md5 from "js-md5";
import { UsersService } from "../../services/dbservices/UsersService";
import {
  LogicError,
  MentionedUserNotIndexedError,
  LastFMReverseLookupError,
  SenderUserNotIndexedError,
  UnknownError,
  UsernameNotRegisteredError,
  SenderUserNotAuthenticatedError,
} from "../../errors/errors";
import { GowonService } from "../../services/GowonService";
import { CommandGroup } from "./CommandGroup";
import { Logger } from "../Logger";
import { Rollout } from "./Rollout";
import { TrackingService } from "../../services/TrackingService";
import { User } from "../../database/entity/User";
import { GowonClient } from "../GowonClient";
import { Validation, ValidationChecker } from "../validation/ValidationChecker";
import { Emoji, EmojiRaw } from "../Emoji";
import { RunAs } from "./RunAs";
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
import { AnalyticsCollector } from "../../analytics/AnalyticsCollector";
import { RollbarService } from "../../services/Rollbar/RollbarService";
import { NowPlayingEmbedParsingService } from "../../services/NowPlayingEmbedParsingService";
import { CommandAccess } from "./access/access";
import { GowonContext } from "../context/Context";
import { ArgumentParsingService } from "../../services/arguments/ArgumentsParsingService";
import {
  ArgumentName,
  ArgumentsMap,
  ParsedArguments,
} from "../context/arguments/types";
import {
  DiscordService,
  ReplyOptions,
  SendOptions,
} from "../../services/Discord/DiscordService";
import { Payload } from "../context/Payload";
import { SettingsService } from "../settings/SettingsService";
import config from "../../../config.json";
import { Responder } from "../../services/Responder";

export interface Variation {
  name: string;
  variation: string[] | string;
  description?: string;
  separateSlashCommand?: boolean;
}

export interface CommandRedirect<T extends ArgumentsMap> {
  redirectTo: { new (): BaseCommand };
  when(args: ParsedArguments<T>): boolean;
}

export abstract class BaseCommand<ArgumentsType extends ArgumentsMap = {}> {
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
  redirects: CommandRedirect<ArgumentsType>[] = [];
  redirectedFrom?: BaseCommand;

  /**
   * Slash command meta data
   * (properties related to how slash commands are registered/handled)
   */
  // Controls whether to register a command as a slash command
  slashCommand?: boolean;
  slashCommandName?: string;

  /**
   * Twitter command meta data
   * (properties related to how twitter commands are registered/handled)
   */
  // Controls whether to register a command as a twitter command
  twitterCommand?: boolean;

  /**
   * Parent-child metadata
   * (properties related to a commands parents or children)
   */
  hasChildren = false;
  children?: CommandGroup;
  parentName?: string;
  isChild?: boolean;

  /**
   * Descriptive metadata
   * (properties related to decribing commands for end users)
   */
  description: string = "No description for this command";
  // Extra description that doesn't fit in slash command descriptions
  extraDescription: string = "";
  category: string | undefined = undefined;
  subcategory: string | undefined = undefined;
  usage: string | string[] = "";
  customHelp?: { new (): BaseCommand } | undefined;
  guildRequired?: boolean;

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
  adminCommand: boolean = false;
  access?: CommandAccess;
  rollout: Rollout = {};

  /**
   * Argument metadata
   * (properties related to what arguments a command takes)
   */
  arguments: ArgumentsType = {} as any;
  validation: Validation = {};

  /**
   * Run-specific data
   * (properties set before a command is run)
   */
  // Has to be any typed because the parsed flags aren't optionally typed
  // because they always will be either true or false
  // this is set by the FlagParser when this.parseArguments() is called
  parsedArguments: ParsedArguments<ArgumentsType> =
    {} as ParsedArguments<ArgumentsType>;

  logger = new Logger();

  get payload() {
    return this.ctx.payload;
  }

  get runAs() {
    return this.ctx.runAs;
  }

  get guild(): Guild | undefined {
    return this.ctx.guild;
  }

  get requiredGuild(): Guild {
    return this.ctx.requiredGuild;
  }

  get author() {
    return this.ctx.author;
  }

  get gowonClient() {
    return this.ctx.client;
  }

  ctx!: GowonContext<typeof this["customContext"]>;
  customContext = {};

  /**
   * Misc metadata
   */
  showLoadingAfter?: number;
  isCompleted = false;

  get friendlyNameWithParent(): string {
    return (
      (this.parentName ? this.parentName.trim() + " " : "") + this.friendlyName
    );
  }

  commandRegistry = CommandRegistry.getInstance();

  track = ServiceRegistry.get(TrackingService);
  responder = ServiceRegistry.get(Responder);
  usersService = ServiceRegistry.get(UsersService);
  gowonService = ServiceRegistry.get(GowonService);
  discordService = ServiceRegistry.get(DiscordService);
  rollbarService = ServiceRegistry.get(RollbarService);
  settingsService = ServiceRegistry.get(SettingsService);
  mirrorballService = ServiceRegistry.get(MirrorballService);
  analyticsCollector = ServiceRegistry.get(AnalyticsCollector);
  mirrorballUsersService = ServiceRegistry.get(MirrorballUsersService);
  argumentParsingService = ServiceRegistry.get(ArgumentParsingService);
  nowPlayingEmbedParsingService = ServiceRegistry.get(
    NowPlayingEmbedParsingService
  );

  mutableContext<T>(): GowonContext<{ mutable: T }> {
    return this.ctx as GowonContext<{ mutable: T }>;
  }

  async getChild(_: string, __: string): Promise<BaseCommand | undefined> {
    return undefined;
  }

  get id(): string {
    return md5(this.idSeed);
  }

  get prefix(): string {
    return this.payload.isInteraction()
      ? "/"
      : this.guild
      ? this.gowonService.prefix(this.guild.id)
      : config.defaultPrefix;
  }

  abstract run(): Promise<void>;

  async getMentions({
    senderRequired = false,
    usernameRequired = true,
    userArgumentName = "user" as ArgumentName<ArgumentsType>,
    inputArgumentName = "username" as ArgumentName<ArgumentsType>,
    lfmMentionArgumentName = "lastfmUsername" as ArgumentName<ArgumentsType>,
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

    if (user && this.payload.isMessage() && this.payload.source.reference) {
      const reply = await this.payload.source.fetchReference();

      if (this.nowPlayingEmbedParsingService.hasParsableEmbed(this.ctx, reply))
        if (
          this.gowonClient.isBot(user.id, [
            "gowon",
            "gowon development",
            "fmbot",
            "fmbot develop",
            "chuu",
            "who knows",
          ])
        ) {
          user = (Array.from(this.payload.source.mentions.users)[1] || [])[1];
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
        this.payload.author.id
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
        if (!this.isCompleted && this.payload.isMessage()) {
          this.payload.source.react(Emoji.loading);
        }
      }, this.showLoadingAfter * 1000);
    }

    this.autoUpdateUser();
  }

  async teardown() {
    if (this.debug) {
      console.log(this.constructor.name + "", this);
    }

    this.logger.closeCommandHeader(this);
    this.isCompleted = true;

    if (this.showLoadingAfter && this.payload.isMessage()) {
      this.payload.source.reactions
        .resolve(EmojiRaw.loading)
        ?.users.remove(this.gowonClient.client.user!);
    }
  }

  async execute(payload: Payload, runAs: RunAs, gowonClient: GowonClient) {
    this.ctx = new GowonContext({
      custom: Object.assign(this.customContext, {
        analyticsCollector: this.analyticsCollector,
      }) as any,
      command: this,
      payload,
      runAs,
      gowonClient,
    });

    if (!this.checkRollout()) {
      return;
    }

    await this.setup();

    try {
      this.parsedArguments = this.parseArguments();

      if ((this.parsedArguments as any).debug) {
        this.debug = true;
      }

      for (const redirect of this.redirects) {
        if (redirect.when(this.parsedArguments)) {
          const command = new redirect.redirectTo();
          command.redirectedFrom = this;
          await command.execute(payload, runAs, gowonClient);
          return;
        }
      }

      this.logger.logCommand(this, payload, runAs.toArray().join(" "));
      this.analyticsCollector.metrics.commandRuns.inc();

      new ValidationChecker(this.parsedArguments, this.validation).validate();

      if (this.payload.isInteraction()) {
        this.mutableContext<{
          deferredResponseTimeout?: NodeJS.Timeout;
        }>().mutable.deferredResponseTimeout = setTimeout(() => {
          (this.payload.source as CommandInteraction).deferReply();
          this.mutableContext<{ deferred: boolean }>().mutable.deferred = true;
        }, 2000);
      }

      await this.prerun();
      await this.run();
    } catch (e: any) {
      this.logger.logError(e);
      this.analyticsCollector.metrics.commandErrors.inc();
      this.rollbarService.logError(this.ctx, e);

      console.log(e);

      if (e.isClientFacing && !e.silent) {
        await this.sendError(e.message, e.footer);
      } else if (!e.isClientFacing) {
        await this.sendError(new UnknownError().message);
      }
    }

    await this.teardown();
  }

  parseArguments(): ParsedArguments<ArgumentsType> {
    return this.argumentParsingService.parseContext(this.ctx, this.arguments);
  }

  async send(
    content: MessageEmbed | string,
    options?: Partial<SendOptions>
  ): Promise<Message> {
    return await this.discordService.send(this.ctx, content, options);
  }

  async reply(
    content: string,
    options?: Partial<ReplyOptions>
  ): Promise<Message> {
    return await this.discordService.send(this.ctx, content, {
      reply: options || true,
    });
  }

  async dmAuthor(content: string | MessageEmbed): Promise<Message> {
    return await this.discordService.send(this.ctx, content, {
      inChannel: await this.ctx.author.createDM(true),
    });
  }

  async traditionalReply(message: string): Promise<Message> {
    const content = `<@!${this.author.id}>, ` + message.trimStart();

    return await this.discordService.send(this.ctx, content);
  }

  checkRollout(): boolean {
    return (
      checkRollout(this.rollout, this.payload) ||
      this.gowonClient.isDeveloper(this.author.id)
    );
  }

  public copy(): BaseCommand {
    return CommandRegistry.getInstance().make(this.id);
  }

  async getRepliedMessage(): Promise<Message | undefined> {
    if (this.payload.isMessage() && this.payload.source.reference) {
      return await this.payload.source.fetchReference();
    }

    return undefined;
  }

  newEmbed(embed?: MessageEmbed): MessageEmbed {
    return gowonEmbed(this.payload.member ?? undefined, embed);
  }

  generateEmbedAuthor(title?: string): EmbedAuthorData {
    return {
      name: title
        ? `${this.payload.author.tag} | ${title}`
        : `${this.payload.author.tag}`,
      iconURL: this.payload.author.avatarURL() || undefined,
    };
  }

  protected async fetchUsername(id: string): Promise<string> {
    try {
      let member = await this.requiredGuild.members.fetch(id);
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
        this.requiredGuild
      );

      let purgatoryRole = await this.gowonService.getPurgatoryRole(
        this.requiredGuild
      );

      let usersInPurgatory = purgatoryRole
        ? (await this.requiredGuild.members.fetch())
            .filter((m) => m.roles.cache.has(purgatoryRole!))
            .map((m) => m.user.id)
        : [];

      filter = (id: string) => {
        return !crownBannedUsers.includes(id) && !usersInPurgatory.includes(id);
      };
    }

    return (await this.requiredGuild.members.fetch())
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

    await this.responder.discord(this.ctx, embed);
    await this.responder.twitter(this.ctx, message);
  }

  protected get scopes() {
    const guild = { guildID: this.requiredGuild.id };
    const user = { userID: this.author.id };
    const guildMember = Object.assign(guild, user);

    return { guild, user, guildMember };
  }

  protected startTyping() {
    this.discordService.startTyping(this.ctx);
  }

  protected async getDiscordUserFromUsername(
    username: string
  ): Promise<DiscordUser | undefined> {
    const members = await this.requiredGuild.members.fetch();

    const member = members.find(
      (m) =>
        m.user.username.toLowerCase() === username ||
        m.nickname?.toLowerCase() === username
    );

    return member?.user;
  }

  private autoUpdateUser() {
    if (
      this.author.id &&
      Chance().bool({ likelihood: 33 }) &&
      !["update", "index", "login", "logout"].includes(this.name) &&
      !this.gowonClient.isInIssueMode
    ) {
      this.usersService
        .getUser(this.ctx, this.author.id)
        .then(async (senderUser) => {
          if (senderUser) {
            await Promise.all([
              this.mirrorballService.quietAddUserToGuild(
                this.ctx,
                this.author.id,
                this.requiredGuild.id
              ),
              senderUser.mirrorballUpdate(this.ctx),
            ]);
          }
        })
        .catch(() => {});
    }
  }

  protected messageIsReply(): boolean {
    return this.payload.isMessage() && !!this.payload.source.reference;
  }
}
