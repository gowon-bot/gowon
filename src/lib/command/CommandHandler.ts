import { Message } from "discord.js";
import { GowonService } from "../../services/GowonService";
import { AdminService } from "../../services/dbservices/AdminService";
import { Logger } from "../Logger";
import { CheckFailReason } from "../permissions/Can";
import { ParentCommand } from "./ParentCommand";
import { MetaService } from "../../services/dbservices/MetaService";
import Prefix from "../../commands/Meta/Prefix";
import { GowonClient } from "../GowonClient";
import { RunAs } from "./RunAs";
import { NicknameService } from "../../services/guilds/NicknameService";
import Help from "../../commands/Help/Help";
import { CommandRegistry } from "./CommandRegistry";
import { Command } from "./Command";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export class CommandHandler {
  commandRegistry = CommandRegistry.getInstance();
  client!: GowonClient;

  adminService = ServiceRegistry.get(AdminService);
  metaService = ServiceRegistry.get(MetaService);
  gowonService = ServiceRegistry.get(GowonService);
  private nicknameService = ServiceRegistry.get(NicknameService);
  private logger = new Logger();

  setClient(client: GowonClient) {
    this.client = client;
  }

  get context() {
    return {
      logger: this.logger,
      client: this.client,
      adminService: this.adminService,
    };
  }

  async init() {
    await this.commandRegistry.init();
  }

  async handle(message: Message): Promise<void> {
    this.nicknameService.recordNickname(
      this.context,
      message.author.id,
      message.guild?.id,
      message.member?.nickname || message.author.username
    );
    this.nicknameService.recordUsername(
      this.context,
      message.author.id,
      message.author.username + "#" + message.author.discriminator
    );

    if (
      !(message.content.toLowerCase() === "not good bot") &&
      (message.content.toLowerCase() === "good bot" ||
        message.content.toLowerCase() === "thank you bot" ||
        message.content.toLowerCase() === "thanks bot" ||
        message.content.toLowerCase() === "not bad bot")
    ) {
      message.react("🥰");
    } else if (
      message.content.toLowerCase() === "bad bot" ||
      message.content.toLowerCase() === "stupid bot" ||
      message.content.toLowerCase() === "fuck you bot" ||
      message.content.toLowerCase() === "not good bot"
    ) {
      message.react("😔");
    }

    await this.runHelpCommandIfMentioned(message);
    await this.runPrefixCommandIfMentioned(message, this.client);
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

      if (command instanceof ParentCommand) {
        command = (command.default && command.default()) || command;
      }

      if (command.devCommand && !this.client.isDeveloper(message.author.id)) {
        return;
      }

      let canCheck = await this.adminService.can.run(
        this.context,
        command,
        message,
        this.client,
        {
          useChannel: true,
        }
      );

      if (!canCheck.passed) {
        Logger.log(
          "CommandHandler",
          canCheck.reason === CheckFailReason.disabled
            ? `Attempt to run disabled command ${command.name}`
            : `User ${message.author.username} did not have permissions to run command ${command.name} (${command.id})`
        );

        return;
      }

      this.logger.logCommandHandle(runAs);

      this.metaService.recordCommandRun(this.context, command.id, message);

      this.runCommand(command, message, runAs);
    }
  }

  async runPrefixCommandIfMentioned(message: Message, client: GowonClient) {
    if (
      message.mentions.users.has(this.client.client.user!.id) &&
      message.content.split(/\s+/)[1]?.toLowerCase() === "prefix" &&
      !message.author.bot &&
      (message.member?.permissions?.has("ADMINISTRATOR") ||
        client.isDeveloper(message.author.id))
    ) {
      let prefix: string | undefined =
        message.content.split(/\s+/)[2] || undefined;

      const prefixCommand = new Prefix().setPrefix(prefix);
      prefixCommand.gowonClient = this.client;

      await prefixCommand.execute(message, new RunAs());
    }
  }

  async runHelpCommandIfMentioned(message: Message) {
    if (
      message.mentions.users.has(this.client.client.user!.id) &&
      message.content.split(/\s+/)[1]?.toLowerCase() === "help" &&
      !message.author.bot
    ) {
      const helpCommand = new Help();
      helpCommand.gowonClient = this.client;

      message.content = "";

      await helpCommand.execute(message, new RunAs());
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
      message.content.split(/\s+/)[1].toLowerCase() === "you" &&
      this.client.isBot(message.author.id, "rem")
    ) {
      await message.reply("Yes ma'am!");
    }
  }

  private async runCommand(command: Command, message: Message, runAs: RunAs) {
    const newCommand = command.copy();

    newCommand.gowonClient = this.client;

    await newCommand.execute.bind(newCommand)(message, runAs);
  }
}
