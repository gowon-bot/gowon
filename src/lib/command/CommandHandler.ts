import { CommandManager } from "./CommandManager";
import { Client, Message } from "discord.js";
import { GowonService } from "../../services/GowonService";
import { AdminService } from "../../services/dbservices/AdminService";
import { Logger } from "../Logger";
import { CheckFailReason } from "../permissions/Can";
import { ParentCommand } from "./ParentCommand";
import { MetaService } from "../../services/dbservices/MetaService";
import Prefix from "../../commands/Meta/Prefix";
import { RunAs } from "../AliasChecker";

export class CommandHandler {
  gowonService = GowonService.getInstance();
  adminService = new AdminService();
  metaService = new MetaService();
  commandManager = new CommandManager();
  private logger = new Logger();
  private client!: Client;

  setClient(client: Client) {
    this.client = client;
  }

  async init() {
    await this.commandManager.init();
  }

  async handle(message: Message): Promise<void> {
    if (
      !message.content.toLowerCase().includes("not good bot") &&
      (message.content.toLowerCase().includes("good bot") ||
        message.content.toLowerCase().includes("thank you bot") ||
        message.content.toLowerCase().includes("thanks bot") ||
        message.content.toLowerCase().includes("not bad bot"))
    ) {
      message.react("🥰");
    } else if (
      message.content.toLowerCase().includes("stupid bot") ||
      message.content.toLowerCase().includes("fuck you bot") ||
      message.content.toLowerCase().includes("not good bot")
    ) {
      message.react("😔");
    }

    await this.runPrefixCommandIfMentioned(message);

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
      let { command, runAs } = this.commandManager.find(
        message.content,
        message.guild.id
      );

      if (command instanceof ParentCommand)
        command = (command.default && command.default()) || command;

      let canCheck = await this.adminService.can.run(command, message);

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

      this.metaService.recordCommandRun(command.id, message);

      await command.execute(message, runAs);
    }
  }

  async runPrefixCommandIfMentioned(message: Message) {
    if (
      message.mentions.users
        .array()
        .map((u) => u.id)
        .includes(this.client.user!.id) &&
      message.content.split(/\s+/)[1].toLowerCase() === "prefix" &&
      !message.author.bot
    ) {
      let prefix: string | undefined =
        message.content.split(/\s+/)[2] || undefined;

      await new Prefix().setPrefix(prefix).execute(message, new RunAs());
    }
  }
}
