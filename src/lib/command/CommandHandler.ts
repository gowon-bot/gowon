import { Message } from "discord.js";
import { GowonService } from "../../services/GowonService";
import { HeaderlessLogger, Logger } from "../Logger";
import { ParentCommand } from "./ParentCommand";
import { MetaService } from "../../services/dbservices/MetaService";
import { GowonClient } from "../GowonClient";
import { RunAs } from "./RunAs";
import {
  NicknameService,
  NicknameServiceContext,
} from "../../services/Discord/NicknameService";
import { CommandRegistry } from "./CommandRegistry";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import Prefix from "../../commands/Meta/Prefix";
import Help from "../../commands/Help/Help";
import { GowonContext } from "../context/Context";
import { Payload } from "../context/Payload";
import { Command } from "./Command";
import { PermissionsService } from "../permissions/PermissionsService";

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
      runAs: new RunAs(),
      command: {
        logger: this.logger,
        guild: message.guild!,
        author: message.author,
      } as any,
    });
  }

  async handle(message: Message): Promise<void> {
    await this.runHelpCommandIfMentioned(message);
    await this.runPrefixCommandIfMentioned(message);
    await this.gers(message);
    await this.yesMaam(message);

    if (
      !message.author.bot &&
      message.guild &&
      message.content.match(
        new RegExp(
          `^${this.gowonService.regexSafePrefix(message.guild!.id)}[^\\s]+`,
          "i"
        )
      )
    ) {
      let { command, runAs } = await this.commandRegistry.find(
        message.content,
        message.guild.id
      );

      if (!command) return;

      this.nicknameService.recordNickname(
        this.context(message) as NicknameServiceContext,
        message.author.id,
        message.member?.nickname || message.author.username
      );
      this.nicknameService.recordUsername(
        this.context(message) as NicknameServiceContext,
        message.author.id,
        message.author.username + "#" + message.author.discriminator
      );

      if (command instanceof ParentCommand) {
        const defaultID = command.default?.()?.id;

        if (defaultID) {
          command = this.commandRegistry.findByID(defaultID) || command;
        }
      }

      const canCheck = await this.permissionsService.canRunInContext(
        this.context(message),
        command
      );

      if (!canCheck.allowed) {
        this.handleFailedCanCheck(command);
        return;
      }

      this.logger.logCommandHandle(runAs);

      this.metaService.recordCommandRun(
        this.context(message),
        command.id,
        message
      );

      this.runCommand(command, message, runAs);
    }
  }

  async runPrefixCommandIfMentioned(message: Message) {
    if (
      message.mentions.users.has(this.client.client.user!.id) &&
      message.content.split(/\s+/)[1]?.toLowerCase() === "prefix" &&
      !message.author.bot
    ) {
      let prefix: string | undefined =
        message.content.split(/\s+/)[2] || undefined;

      const prefixCommand = new Prefix().setPrefix(prefix);

      const ctx = new GowonContext({
        payload: new Payload(message),
        runAs: new RunAs(),
        gowonClient: this.client,
      });

      await prefixCommand.execute(ctx);
    }
  }

  async runHelpCommandIfMentioned(message: Message) {
    if (
      message.mentions.users.has(this.client.client.user!.id) &&
      message.content.split(/\s+/)[1]?.toLowerCase() === "help" &&
      !message.author.bot
    ) {
      const helpCommand = new Help();

      message.content = "";

      const ctx = new GowonContext({
        payload: new Payload(message),
        runAs: new RunAs(),
        gowonClient: this.client,
      });

      await helpCommand.execute(ctx);
    }
  }

  async gers(message: Message) {
    if (
      message.mentions.users.has(this.client.client.user!.id) &&
      message.content.split(/\s+/)[1]?.toLowerCase() === "pog" &&
      !message.author.bot
    ) {
      await message.channel.send("gers");
    }
  }

  async yesMaam(message: Message) {
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

  private async runCommand(command: Command, message: Message, runAs: RunAs) {
    const newCommand = command.copy();

    const ctx = new GowonContext({
      payload: new Payload(message),
      gowonClient: this.client,
      runAs,
    });

    try {
      await newCommand.execute.bind(newCommand)(ctx);
    } catch {}
  }

  private handleFailedCanCheck(command: Command) {
    Logger.log(
      "CommandHandler",
      `Attempt to run disabled command ${command.name}`
    );
  }
}
