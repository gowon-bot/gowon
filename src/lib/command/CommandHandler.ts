import { Message } from "discord.js";
import { GowonService } from "../../services/GowonService";
import { HeaderlessLogger, Logger } from "../Logger";
import { ParentCommand } from "./ParentCommand";
import { MetaService } from "../../services/dbservices/MetaService";
import { GowonClient } from "../GowonClient";
import {
  NicknameService,
  NicknameServiceContext,
} from "../../services/Discord/NicknameService";
import { CommandRegistry } from "./CommandRegistry";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import Prefix from "../../commands/Meta/Prefix";
import { GowonContext } from "../context/Context";
import { Payload } from "../context/Payload";
import { Command } from "./Command";
import { PermissionsService } from "../permissions/PermissionsService";
import { userMentionAtStartRegex } from "../../helpers/discord";
import { ExtractedCommand } from "./extractor/ExtractedCommand";

export class CommandHandler {
  commandRegistry = CommandRegistry.getInstance();
  client!: GowonClient;

  permissionsService = ServiceRegistry.get(PermissionsService);
  metaService = ServiceRegistry.get(MetaService);
  gowonService = ServiceRegistry.get(GowonService);
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

  async handle(message: Message): Promise<void> {
    await this.runPrefixCommandIfMentioned(message);
    await this.gers(message);
    await this.yesMaam(message);

    if (this.shouldSearchForCommand(message)) {
      const extract = await this.findCommand(message);

      if (extract) {
        const command = extract.command;

        this.recordUsernameAndNickname(message);

        if (!(await this.canRunCommand(message, command))) return;

        this.logger.logCommandHandle(extract);

        this.metaService.recordCommandRun(
          this.context(message),
          command.id,
          message
        );

        this.runCommand(command, message, extract);
      }
    }
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
    const mentionedRegex = userMentionAtStartRegex(this.client.client.user!.id);

    return mentionedRegex.test(message.content);
  }
}
