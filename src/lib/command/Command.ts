import { Chance } from "chance";
import {
  CommandInteraction,
  EmbedAuthorData,
  Guild,
  Message,
  MessageEmbed,
} from "discord.js";
import md5 from "js-md5";
import config from "../../../config.json";
import { AnalyticsCollector } from "../../analytics/AnalyticsCollector";
import { UnknownError } from "../../errors/errors";
import { SimpleMap } from "../../helpers/types";
import { DiscordService } from "../../services/Discord/DiscordService";
import {
  ReplyOptions,
  SendOptions,
} from "../../services/Discord/DiscordService.types";
import { GowonService } from "../../services/GowonService";
import { NowPlayingEmbedParsingService } from "../../services/NowPlayingEmbedParsingService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { TrackingService } from "../../services/TrackingService";
import { ArgumentParsingService } from "../../services/arguments/ArgumentsParsingService";
import { MentionsService } from "../../services/arguments/mentions/MentionsService";
import {
  GetMentionsOptions,
  Mentions,
} from "../../services/arguments/mentions/MentionsService.types";
import { UsersService } from "../../services/dbservices/UsersService";
import { LilacUsersService } from "../../services/lilac/LilacUsersService";
import { MirrorballService } from "../../services/mirrorball/MirrorballService";
import { MirrorballUsersService } from "../../services/mirrorball/services/MirrorballUsersService";
import { Emoji, EmojiRaw } from "../Emoji";
import { constants } from "../constants";
import { GowonContext } from "../context/Context";
import { ArgumentsMap, ParsedArguments } from "../context/arguments/types";
import { SettingsService } from "../settings/SettingsService";
import { Validation, ValidationChecker } from "../validation/ValidationChecker";
import { errorEmbed, gowonEmbed } from "../views/embeds";
import { CommandGroup } from "./CommandGroup";
import { CommandRegistry } from "./CommandRegistry";
import { CommandAccess } from "./access/access";

export interface Variation {
  name: string;
  variation: string[] | string;
  description?: string;
  separateSlashCommand?: boolean;
  overrideArgs?: SimpleMap;
}

export interface CommandRedirect<T extends ArgumentsMap> {
  redirectTo: { new (): Command };
  when(args: ParsedArguments<T>): boolean;
}

export abstract class Command<ArgumentsType extends ArgumentsMap = {}> {
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
  redirectedFrom?: Command;

  /**
   * Slash command meta data
   * (properties related to how slash commands are registered/handled)
   */
  // Controls whether to register a command as a slash command
  slashCommand?: boolean;
  slashCommandName?: string;

  /**
   * Parent-child metadata
   * (properties related to a commands parents or children)
   */
  hasChildren = false;
  children?: CommandGroup;
  parentName?: string;
  parentID?: string;
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
  customHelp?: { new (): Command } | undefined;
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

  get logger() {
    return this.ctx.logger;
  }

  get payload() {
    return this.ctx.payload;
  }

  get extract() {
    return this.ctx.extract;
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

  get prefix(): string {
    return this.payload.isInteraction()
      ? "/"
      : this.guild
      ? this.gowonService.prefix(this.guild.id)
      : config.defaultPrefix;
  }

  ctx!: GowonContext<(typeof this)["customContext"]>;
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

  track = ServiceRegistry.get(TrackingService);
  usersService = ServiceRegistry.get(UsersService);
  gowonService = ServiceRegistry.get(GowonService);
  discordService = ServiceRegistry.get(DiscordService);
  settingsService = ServiceRegistry.get(SettingsService);
  mentionsService = ServiceRegistry.get(MentionsService);
  mirrorballService = ServiceRegistry.get(MirrorballService);
  lilacUsersService = ServiceRegistry.get(LilacUsersService);
  analyticsCollector = ServiceRegistry.get(AnalyticsCollector);
  // Soon to be deprecated...
  mirrorballUsersService = ServiceRegistry.get(MirrorballUsersService);
  argumentParsingService = ServiceRegistry.get(ArgumentParsingService);
  nowPlayingEmbedParsingService = ServiceRegistry.get(
    NowPlayingEmbedParsingService
  );

  get commandRegistry() {
    return CommandRegistry.getInstance();
  }

  /**
   * Helper getters
   */

  mutableContext<T extends Record<string, unknown>>(): GowonContext<{
    mutable: T;
  }> {
    return this.ctx as GowonContext<{ mutable: T }>;
  }

  // Implemented in ParentCommand
  async getChild(_: string, __: string): Promise<Command | undefined> {
    return undefined;
  }

  get id(): string {
    return md5(this.idSeed);
  }

  // Returns a fresh instance of this command from the registry
  public copy(): Command {
    return CommandRegistry.getInstance().make(this.id);
  }

  /**
   * Execution
   * (These methods are called when a command is actually run)
   */

  // Must be implemented
  abstract run(): Promise<void>;

  // This method may be implemented by some base or child commands
  // which allow them to run code before the run method is called
  async beforeRun(): Promise<void> {}

  async execute(ctx: GowonContext) {
    ctx.setCommand(this);
    ctx.addContext(this.customContext);
    this.ctx = ctx;

    await this.setup();

    try {
      this.parsedArguments = this.parseArguments();

      if (await this.redirectIfRequired(ctx)) return;

      this.logger.logCommand(ctx);
      this.analyticsCollector.metrics.commandRuns.inc();

      this.deferResponseIfInteraction();

      await this.beforeRun();
      await this.run();
    } catch (e: any) {
      await this.handleRunError(e);
    }

    await this.teardown();
  }

  /**
   * Execution helpers
   * (These methods are called by execute)
   */

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

  parseArguments(): ParsedArguments<ArgumentsType> {
    const parsedArguments = this.argumentParsingService.parseContext(
      this.ctx,
      this.arguments
    );

    this.debug = !!(this.parsedArguments as any).debug;

    new ValidationChecker(parsedArguments, this.validation).validate();

    return parsedArguments;
  }

  private async redirectIfRequired(ctx: GowonContext): Promise<boolean> {
    for (const redirect of this.redirects) {
      if (redirect.when(this.parsedArguments)) {
        const command = new redirect.redirectTo();
        command.redirectedFrom = this;
        await command.execute(ctx);
        return true;
      }
    }

    return false;
  }

  private async deferResponseIfInteraction() {
    if (this.payload.isInteraction()) {
      this.mutableContext<{
        deferredResponseTimeout?: NodeJS.Timeout;
      }>().mutable.deferredResponseTimeout = setTimeout(() => {
        (this.payload.source as CommandInteraction).deferReply();
        this.mutableContext<{ deferredAt: Date }>().mutable.deferredAt =
          new Date();
      }, 2000);
    }
  }

  protected async handleRunError(e: any) {
    this.logger.logError(e);
    this.analyticsCollector.metrics.commandErrors.inc();

    console.log(e);

    if (e.isClientFacing && !e.silent) {
      await this.sendError(e.message, e.footer);
    } else if (!e.isClientFacing) {
      await this.sendError(new UnknownError().message);
    }
  }

  /**
   * Helpers
   * (These methods are called when by a command when needed)
   */
  async getMentions(options?: Partial<GetMentionsOptions>): Promise<Mentions> {
    return this.mentionsService.getMentions(this.ctx, options || {});
  }

  /**
   * Discord helpers
   * (These methods help interact with Discord)
   */

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

  // Mimics the old Discord.js reply method
  async oldReply(message: string): Promise<Message> {
    const content = `<@!${this.author.id}>, ` + message.trimStart();

    return await this.discordService.send(this.ctx, content);
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

  generateEmbedAuthor(title?: string, url?: string): EmbedAuthorData {
    return {
      name: title
        ? `${this.payload.author.tag} | ${title}`
        : `${this.payload.author.tag}`,
      iconURL:
        this.payload.member.avatarURL() ||
        this.payload.author.avatarURL() ||
        undefined,
      url: url,
    };
  }

  protected async fetchUsername(id: string): Promise<string> {
    try {
      let member = await this.requiredGuild.members.fetch(id);
      return member.user.username;
    } catch {
      return constants.unknownUserDisplay;
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

  protected async sendError(message: string, footer = "") {
    const embed = errorEmbed(
      this.newEmbed(),
      this.author,
      this.ctx.authorMember,
      message,
      footer
    );

    await this.send(embed);
  }

  protected startTyping() {
    this.discordService.startTyping(this.ctx);
  }

  protected messageIsReply(): boolean {
    return this.payload.isMessage() && !!this.payload.source.reference;
  }

  /**
   * Command helpers
   * (These methods help interact with command metadata)
   */

  protected variationWasUsed(...names: string[]): boolean {
    for (let variation of this.variations.filter((v) =>
      names.includes(v.name)
    )) {
      const variations =
        variation.variation instanceof Array
          ? variation.variation
          : [variation.variation];

      if (this.extract.didMatch(...variations)) return true;
    }

    return false;
  }

  /**
   * Misc helpers
   */

  protected get scopes() {
    const guild = { guildID: this.requiredGuild.id };
    const user = { userID: this.author.id };
    const guildMember = Object.assign(guild, user);

    return { guild, user, guildMember };
  }

  private async autoUpdateUser() {
    if (
      this.author.id &&
      Chance().bool({ likelihood: 33 }) &&
      !["update", "index", "login", "logout"].includes(this.name) &&
      !this.gowonClient.isInIssueMode &&
      !this.gowonClient.isTesting
    ) {
      const senderUser = await this.usersService.getUser(
        this.ctx,
        this.author.id
      );

      if (senderUser) {
        this.lilacUsersService.update(this.ctx, senderUser);

        try {
          await this.mirrorballUsersService.quietAddUserToGuild(
            this.ctx,
            this.author.id,
            this.requiredGuild.id
          );
        } catch (e) {}
      }
    }
  }
}
