import { EmbedAuthorData, EmbedBuilder, Guild, Message } from "discord.js";
import md5 from "js-md5";
import { ClientError } from "../../errors/errors";
import { GuildRequiredError } from "../../errors/gowon";
import { DiscordService } from "../../services/Discord/DiscordService";
import {
  ReplyOptions,
  SendOptions,
  Sendable,
  SendableContentType,
} from "../../services/Discord/DiscordService.types";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { ArgumentParsingService } from "../../services/arguments/ArgumentsParsingService";
import { UsersService } from "../../services/dbservices/UsersService";
import { GowonContext } from "../context/Context";
import { ArgumentsMap, ParsedArguments } from "../context/arguments/types";
import { Validation, ValidationChecker } from "../validation/ValidationChecker";
import { displayUserTag } from "../views/displays";
import { errorEmbed, gowonEmbed } from "../views/embeds";

export enum RunnableType {
  InteractionReply,
  Command,
}

export abstract class Runnable<ArgumentsType extends ArgumentsMap = {}> {
  static type: RunnableType;

  protected debug = false;

  /**
   * Indexing metadata
   * (properties related to how commands are found)
   */

  /**
   * idSeed is the seed for the generated command id
   * **Must be unique among all runnables!**
   */
  abstract idSeed: string;

  abstract get type(): RunnableType;

  /**
   * Run-condition metadata
   * (properties related to determining if a runnable can be run)
   */
  guildRequired?: boolean;
  archived = false;
  shouldDefer = true;

  get id(): string {
    return md5(this.idSeed);
  }

  /**
   * Runtime metadata
   * (properties used when a runnable is run)
   */
  abstract ctx: GowonContext;
  customContext = {};

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
    return "";
  }

  /**
   * Argument metadata
   * (properties related to what arguments a command takes)
   */
  arguments: ArgumentsType = {} as any;
  validation: Validation = {};

  private _parsedArguments: ParsedArguments<ArgumentsType> =
    {} as ParsedArguments<ArgumentsType>;

  get parsedArguments(): ParsedArguments<ArgumentsType> {
    return this._parsedArguments;
  }

  protected set parsedArguments(args: ParsedArguments<ArgumentsType>) {
    this._parsedArguments = args;
  }

  /**
   * Services
   */
  usersService = ServiceRegistry.get(UsersService);
  discordService = ServiceRegistry.get(DiscordService);
  argumentParsingService = ServiceRegistry.get(ArgumentParsingService);

  /**
   * Execution
   * (These methods are called when a command is actually run)
   */

  // Must be implemented
  abstract run(): Promise<void>;

  // This method may be implemented by some base or child commands
  // which allow them to run code before the run method is called
  async beforeRun(): Promise<void> {}

  async execute(ctx: GowonContext): Promise<void> {
    ctx.setRunnable(this);
    ctx.addContext(this.customContext);
    this.ctx = ctx;

    this.parsedArguments = this.parseArguments();

    if (!(await this.checkGuildRequirement())) return;
  }

  protected parseArguments(): ParsedArguments<ArgumentsType> {
    const parsedArguments = this.argumentParsingService.parseContext(
      this.ctx,
      this.arguments
    );

    this.debug = !!(this.parsedArguments as any).debug;

    new ValidationChecker(parsedArguments, this.validation).validate();

    return parsedArguments;
  }

  /**
   * Helpers
   * (These methods are called when by a command when needed)
   */

  mutableContext<T extends Record<string, unknown>>(): GowonContext<{
    mutable: T;
  }> {
    return this.ctx as GowonContext<{ mutable: T }>;
  }

  private async checkGuildRequirement(): Promise<boolean> {
    if (this.guildRequired && this.ctx.isDM()) {
      await this.sendError(new GuildRequiredError().message);
      return false;
    }

    return true;
  }

  /**
   * Discord helpers
   * (These methods help interact with Discord)
   */

  async send(
    content: SendableContentType,
    options?: Partial<SendOptions>
  ): Promise<Message> {
    return await this.discordService.send(
      this.ctx,
      new Sendable(content),
      options
    );
  }

  protected async sendError(error: Error | string): Promise<void> {
    const errorInstance =
      typeof error === "string" ? new ClientError(error) : error;

    await this.send(
      errorEmbed(
        this.newEmbed(),
        this.author,
        this.ctx.authorMember,
        errorInstance
      )
    );
  }

  newEmbed(embed?: EmbedBuilder): EmbedBuilder {
    return gowonEmbed(this.payload.member ?? undefined, embed);
  }

  generateEmbedAuthor(title?: string, url?: string): EmbedAuthorData {
    return {
      name: title
        ? `${displayUserTag(this.payload.author)} | ${title}`
        : `${displayUserTag(this.payload.author)}`,
      iconURL:
        this.payload.member?.avatarURL() ||
        this.payload.author.avatarURL() ||
        undefined,
      url: url,
    };
  }

  async reply(
    content: string,
    options?: Partial<ReplyOptions>
  ): Promise<Message> {
    return await this.discordService.send(this.ctx, new Sendable(content), {
      reply: options || true,
    });
  }

  async dmAuthor(content: string | EmbedBuilder): Promise<Message> {
    return await this.discordService.send(this.ctx, new Sendable(content), {
      inChannel: await this.ctx.author.createDM(true),
    });
  }

  protected async deferResponseIfInteraction() {
    const payload = this.payload;

    if (payload.isInteraction() && this.shouldDefer) {
      this.mutableContext<{
        deferredResponseTimeout?: NodeJS.Timeout;
      }>().mutable.deferredResponseTimeout = setTimeout(() => {
        if (!payload.source.replied) {
          payload.source.deferReply();
          this.mutableContext<{ deferredAt: Date }>().mutable.deferredAt =
            new Date();
        }
      }, 2000);
    }
  }
}
