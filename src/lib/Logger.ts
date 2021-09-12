import { BaseCommand } from "./command/BaseCommand";
import { Message } from "discord.js";
import chalk from "chalk";
import { format } from "date-fns";
import { RunAs } from "./command/RunAs";

export class Logger {
  static output = true;

  static log(context: string, msg?: any, logger?: Logger): void {
    if (!this.output) return;

    let logString =
      chalk`{grey.bold (${format(
        new Date(),
        "HH:mm:ss a SSS'ms'"
      )})} {grey ${context}:}` +
      " " +
      msg;

    if (logger) {
      logger.header += "\n" + logString;
    } else {
      console.log(logString);
    }
  }

  static formatObject(object: any): string {
    return JSON.stringify(object, undefined, 2);
  }

  header = "";

  log(context: string, msg?: any): void {
    Logger.log(context, msg, this);
  }

  logCommandHandlerSearch(commandName: string): void {
    Logger.log(
      "CommandHandler",
      chalk`{grey looking for command} {bgGrey ${commandName}}`
    );
  }

  logCommandHandle(runAs: RunAs): void {
    Logger.log(
      `CommandHandler`,
      chalk`{grey found ${runAs
        .toCommandArray()
        .map((c) => c.name)
        .join(":")}}`
    );
  }

  openCommandHeader(command: BaseCommand): void {
    this.header = chalk`\n==============={yellow ${
      (command.parentName ? command.parentName + ":" : "") + command.name
    }}====================`;
  }

  closeCommandHeader(command: BaseCommand): void {
    Logger.log("Command", chalk.grey("finished"), this);
    Logger.output &&
      console.log(
        this.header +
          chalk`\n=============={yellow /${
            (command.parentName ? command.parentName + ":" : "") + command.name
          }}====================`
      );
  }

  logCommand(command: BaseCommand, message: Message, ...runAs: string[]): void {
    let delegatedFrom = command.delegatedFrom;

    this.header +=
      "\n" +
      chalk`
{cyan ID}: ${command.id}
${
  delegatedFrom
    ? chalk`{cyan Delegated from}: ${
        (delegatedFrom.parentName ? delegatedFrom.parentName + ":" : "") +
        delegatedFrom.name
      }\n`
    : ""
}{cyan Ran at}: ${message.createdAt} {cyan by} ${
        message.author.username
      } {cyan in} ${message.guild?.name || "{red DMs}"}
{cyan with arguments}: ${Logger.formatObject(command.parsedArguments)}
{cyan as}: ${runAs.join(" ")}

{cyan Raw message content}:
{bgGrey ${message.content}}
{cyan Activity:}`;
    Logger.log("Command", chalk.grey("started"), this);
  }

  logError(error: any): void {
    if (error.isClientFacing) {
      this.header += "\n" + chalk`{red ERROR: ${error}}`;
    } else if (error instanceof Error) {
      this.header += "\n" + chalk.red("ERROR: " + error.stack);
    } else {
      this.header += "\n" + chalk.red("ERROR: " + error);
    }
  }
}
