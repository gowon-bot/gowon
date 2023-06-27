import {
  CommandInteraction,
  EmbedAuthorData,
  EmbedBuilder,
  Guild,
  Message,
} from "discord.js";
import md5 from "js-md5";
import { GuildRequiredError } from "../../errors/gowon";
import { DiscordService } from "../../services/Discord/DiscordService";
import {
  ReplyOptions,
  SendOptions,
  Sendable,
  SendableContentType,
} from "../../services/Discord/DiscordService.types";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { GowonContext } from "../context/Context";
import { displayUserTag } from "../views/displays";
import { errorEmbed, gowonEmbed } from "../views/embeds";

export enum RunnableType {
  Command,
  InteractionReply,
}

export abstract class Runnable {
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

  /**
   * Run-condition metadata
   * (properties related to determining if a runnable can be run)
   */
  guildRequired?: boolean;
  archived = false;

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

  get parsedArguments(): any {
    return {};
  }

  /**
   * Services
   */
  discordService = ServiceRegistry.get(DiscordService);

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

    if (!(await this.checkGuildRequirement())) return;
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
}
