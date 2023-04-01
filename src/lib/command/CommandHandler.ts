import { Message } from "discord.js";
import Prefix from "../../commands/Meta/Prefix";
import { userMentionAtStartRegex } from "../../helpers/discord";
import { DiscordService } from "../../services/Discord/DiscordService";
import {
  NicknameService,
  NicknameServiceContext,
} from "../../services/Discord/NicknameService";
import { GowonService } from "../../services/GowonService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { MetaService } from "../../services/dbservices/MetaService";
import { GowonClient } from "../GowonClient";
import { HeaderlessLogger, Logger } from "../Logger";
import { GowonContext } from "../context/Context";
import { Payload } from "../context/Payload";
import { PermissionsService } from "../permissions/PermissionsService";
import { Command } from "./Command";
import { CommandRegistry } from "./CommandRegistry";
import { ParentCommand } from "./ParentCommand";
import { ExtractedCommand } from "./extractor/ExtractedCommand";

export class CommandHandler {
  commandRegistry = CommandRegistry.getInstance();
  client!: GowonClient;

  permissionsService = ServiceRegistry.get(PermissionsService);
  metaService = ServiceRegistry.get(MetaService);
  gowonService = ServiceRegistry.get(GowonService);
  discordService = ServiceRegistry.get(DiscordService);
  private nicknameService = ServiceRegistry.get(NicknameService);
  private logger = new HeaderlessLogger();

  setClient(client: GowonClient) {
    this.client = client;
  }

  context(message: Message) {
    return new GowonContext({
      gowonClient: this.client,
      payload: new Payload(message),
      extract: new ExtractedCommand([]),
      command: {
        logger: this.logger,
        guild: message.guild!,
        author: message.author,
      } as any,
    });
  }

  async handle(message: Message): Promise<boolean> {
    await Promise.all([
      this.runPrefixCommandIfMentioned(message),
      this.gers(message),
      this.yesMaam(message),
    ]);

    if (this.shouldSearchForCommand(message)) {
      const extract = await this.findCommand(message);

      if (extract) {
        const command = extract.command;

        this.recordUsernameAndNickname(message);

        if (!(await this.canRunCommand(message, command))) return false;

        this.logger.logCommandHandle(extract);

        this.metaService.recordCommandRun(
          this.context(message),
          command.id,
          message
        );

        await this.runCommand(command, message, extract);
        return true;
      }
    }

    return false;
  }

  private shouldSearchForCommand(message: Message): boolean {
    const prefixRegex = this.gowonService.prefixAtStartOfMessageRegex(
      message.guild!.id
    );

    return !!(
      !message.author.bot &&
      message.guild &&
      (message.content.match(prefixRegex) || this.isMentionedAtStart(message))
    );
  }

  private recordUsernameAndNickname(message: Message) {
    const ctx = this.context(message) as NicknameServiceContext;

    this.nicknameService.recordNickname(
      ctx,
      message.author.id,
      message.member?.nickname || message.author.username
    );

    this.nicknameService.recordUsername(
      ctx,
      message.author.id,
      message.author.username + "#" + message.author.discriminator
    );
  }

  private async findCommand(
    message: Message
  ): Promise<ExtractedCommand | undefined> {
    const extract = await this.commandRegistry.find(
      message.content,
      message.guild!.id
    );

    if (extract?.command instanceof ParentCommand) {
      const defaultID = extract.command?.default?.()?.id;

      if (defaultID) {
        const defaultCommand = this.commandRegistry.findByID(defaultID, {
          includeSecret: true,
        });

        if (defaultCommand) {
          extract.add({ command: defaultCommand, matched: "" });
        }
      }
    }

    return extract;
  }

  private async canRunCommand(message: Message, command: Command) {
    const canCheck = await this.permissionsService.canRunInContext(
      this.context(message),
      command
    );

    if (!canCheck.allowed) {
      this.handleFailedCanCheck(command);
      return false;
    }

    return true;
  }

  private handleFailedCanCheck(command: Command) {
    Logger.log(
      "CommandHandler",
      `Attempt to run disabled command ${command.name}`
    );
  }

  private async runCommand(
    command: Command,
    message: Message,
    extract: ExtractedCommand
  ) {
    const newCommand = command.copy();

    const ctx = new GowonContext({
      payload: new Payload(message),
      gowonClient: this.client,
      extract,
    });

    try {
      await newCommand.execute.bind(newCommand)(ctx);
    } catch {}
  }

  private async runPrefixCommandIfMentioned(message: Message) {
    if (
      this.isMentionedAtStart(message) &&
      message.content.split(/\s+/)[1]?.toLowerCase() === "prefix" &&
      !message.author.bot
    ) {
      let prefix: string | undefined =
        message.content.split(/\s+/)[2] || undefined;

      const prefixCommand = new Prefix().setPrefix(prefix);

      const ctx = new GowonContext({
        payload: new Payload(message),
        extract: new ExtractedCommand([]),
        gowonClient: this.client,
      });

      await prefixCommand.execute(ctx);
    }
  }

  private async gers(message: Message) {
    if (
      this.isMentionedAtStart(message) &&
      message.content.split(/\s+/)[1]?.toLowerCase() === "pog" &&
      !message.author.bot
    ) {
      await message.channel.send("gers");
    }
  }

  private async yesMaam(message: Message) {
    const id = this.client.client.user!.id;

    if (
      (message.content.includes(`<@${id}>`) ||
        message.content.includes(`<@!${id}>`)) &&
      message.content.split(/\s+/)[1]?.toLowerCase() === "you" &&
      this.client.isBot(message.author.id, "rem")
    ) {
      await message.reply("Yes ma'am!");
    }
  }

  private isMentionedAtStart(message: Message): boolean {
    const mentionedRegex = userMentionAtStartRegex(this.botID());

    return mentionedRegex.test(message.content);
  }

  private botID(): string {
    return this.client.client.user!.id;
  }
}
